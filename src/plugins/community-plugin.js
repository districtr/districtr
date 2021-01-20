import { html } from "lit-html";

import { PivotTable } from "../components/Charts/PivotTable";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";
import OverlayContainer from "../layers/OverlayContainer";
import MedianIncomeTable from "../components/Charts/MedianIncomeTable";
import DemographicsTable from "../components/Charts/DemographicsTable";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import AboutSection from "../components/AboutSection";
import { Landmarks } from "../components/Landmark";
import { toggle } from "../components/Toggle";
import { bindAll, spatial_abilities } from "../utils";
import { savePlanToStorage } from "../routes";

export default function CommunityPlugin(editor) {
    const { state, mapState } = editor;

    addLocationSearch(mapState);

    const tab = new Tab("community", "Drawing", editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection("Areas of Interest", about.render);

    let lm = state.place.landmarks;
    if (!lm.source && !lm.type) {
        // initialize a blank landmarks object
        // we cannot replace the object, which is used to remember landmarks
        lm.type = "geojson";
        lm.data = {"type": "FeatureCollection", "features": []};
    }
    // compatibility with old landmarks
    lm = lm.source || lm;
    lm.data.features = lm.data.features.filter(f => !f.number_id);

    let lmo;
    if (!state.map.landmarks) {
        state.map.landmarks = new Landmarks(state.map, lm, () => {
          // update landmark list
          savePlanToStorage(state.serialize());
          state.render();
        });
    }
    lmo = new LandmarkOptions(
        state.map.landmarks,
        lm.data.features,
        state.map
    );
    tab.addRevealSection("Important Places", lmo.render.bind(lmo));

    tab.addRevealSection("Help?", () => html`<ul class="option-list">
                                                <li class="option-list__item">
                                                Prompting Questions:
                                                <ul>
                                                    <li>What unites this community?</li>
                                                    <li>Who lives here?</li>
                                                    <li>Are there important places or traditions?</li>
                                                </ul>
                                                </li>`,
                         {isOpen: false, activePartIndex: 0})

    const evaluationTab = new Tab("population", "Evaluation", editor.store);
    const populationPivot = PivotTable(
        "Population",
        state.population,
        state.place.name,
        state.parts,
        spatial_abilities(state.place.id).coalition ? "Coalition" : false
    );
    evaluationTab.addRevealSection("Population", populationPivot, {
        isOpen: true,
        activePartIndex: 0
    });
    if (state.vap) {
        const vapPivot = PivotTable(
            "Voting Age Population",
            state.vap,
            state.place.name,
            state.parts,
            spatial_abilities(state.place.id).coalition ? "Coalition VAP" : false
        );
        evaluationTab.addRevealSection("Voting Age Population", vapPivot, {
            isOpen: false,
            activePartIndex: 0
        });
    }

    if (state.incomes && !["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes(state.place.id)) {
        evaluationTab.addRevealSection(
            'Household Income',
            (uiState, dispatch) =>  html`<div>
                ${MedianIncomeTable(
                    state.incomes,
                    state.activeParts,
                    uiState.charts["Median Income"],
                    dispatch
                )}
            </div>`,
            {
              isOpen: false
            }
        );
    }

    if (state.rent) {
        evaluationTab.addRevealSection(
            'Homeowner or Renter',
            (uiState, dispatch) => html`<div class="sectionThing">
                ${DemographicsTable(
                    state.rent.subgroups,
                    state.activeParts
                )}
            </div>`,
            {
              isOpen: false
            }
        );
    }

    editor.toolbar.addTabFirst(tab);
    editor.toolbar.addTab(evaluationTab);
    editor.store.dispatch(actions.changeTab({ id: "community" }));
}

function addLocationSearch(mapState) {
    return (
        fetch(
            "https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-geocoder/v4.2.0/mapbox-gl-geocoder.min.js"
        )
            .then(r => r.text())
            // eslint-disable-next-line no-eval
            .then(eval)
            .then(() => {
                const bounds = mapState.map.getBounds();
                const bbox = [
                    bounds.getWest(),
                    bounds.getSouth(),
                    bounds.getEast(),
                    bounds.getNorth()
                ];
                // eslint-disable-next-line no-undef
                const geocoder = new MapboxGeocoder({
                    accessToken: mapState.mapboxgl.accessToken,
                    mapboxgl: mapState.mapboxgl,
                    enableEventLogging: false,
                    bbox
                });

                const container = document.createElement("div");
                container.className = "geocoder";
                mapState.map.getContainer().appendChild(container);
                container.appendChild(geocoder.onAdd(mapState.map));
            })
            .catch(e => {
                // eslint-disable-next-line no-console
                console.error("Could not load geocoder");
                // eslint-disable-next-line no-console
                console.error(e);
            })
    );
}

class LandmarkOptions {
    constructor(landmarks, features, map) {
        this.points = landmarks.points;
        this.drawTool = landmarks.drawTool;
        this.features = features;
        this.map = map;
        this.updateLandmarkList = landmarks.updateLandmarkList;

        bindAll(["onSave", "onDelete", "setName", "setDescription", "saveFeature", "deleteFeature"],
            this);

        if (this.features.length) {
            this.updateName = this.features[0].properties.name;
            this.updateDescription = this.features[0].properties.short_description || '';
        } else {
            this.updateName = null;
            this.updateDescription = null;
        }
    }
    // setName / setDescription: remember but don't yet save to map and localStorage
    setName(name) {
        this.updateName = name;
        this.onSave();
    }
    setDescription(description) {
        this.updateDescription = description;
        this.onSave();
    }
    onSave() {
        // save name, description, and location on map and localStorage
        let updateFeature = this.features[this.selectFeature];
        updateFeature.properties.name = this.updateName;
        updateFeature.properties.short_description = this.updateDescription;
        this.saveFeature(updateFeature.id);
    }
    saveFeature(feature_id) {
        // if this feature ID is currently move-able, we lock it
        this.features.forEach((feature) => {
            // if you draw multiple items without saving them
            // saving this feature will save all unsaved points
            // we need to remove their old IDs, too
            if (feature.number_id) {
                this.drawTool.trash(feature.id);
                feature.id = feature.number_id + "";
                delete feature.number_id;

                this.points.data.features.push(feature);
            }
        });

        // save names and locations
        this.map.getSource("landmarkpoints")
            .setData(this.points.data);
        this.updateLandmarkList();
    }
    deleteFeature(delete_id) {
      this.features.forEach((feature, index) => {
          if (feature.id === delete_id) {
              let deleteFeature = this.features.splice(index, 1);
              this.drawTool.trash(deleteFeature.id);

              // if point, also remove from the Points layer
              if (deleteFeature[0].geometry.type === 'Point') {
                  this.points.data.features.forEach((point, pindex) => {
                      if (point.id === delete_id) {
                          this.points.data.features.splice(pindex, 1);
                      }
                  });
              }
          }
      });

      // lock any in-progress shapes before saving to map
      this.saveFeature();
    }
    onDelete() {
        // delete currently viewed shape
        let deleteID = this.features[this.selectFeature].id;
        this.deleteFeature(deleteID);
    }
    render() {
        const properties = this.features.map(feature => feature.properties);

        return html`
    <ul class="landmark-list">
        ${properties.map((p, idx) => html`
          <li>
            <span class="marker-name">${p.name}</span>
            <button class="marker-expand" @click="${() => {
                document.querySelectorAll(".marker-form").forEach((m, idx2) => {
                  m.style.display = (idx === idx2) ? "block" : "none"
                })
                document.querySelectorAll(".marker-expand").forEach((m, idx2) => {
                  m.style.display = (idx === idx2) ? "none" : "inline-block"
                })
            }}"> + </button>
            <div class="marker-form" style="display: none">
              <label>Edit marker:</label>
              <input
                class="text-input"
                type="text"
                placeholder="Name"
                value="${p.name}"
                autofill="off"
                autocomplete="off"
                @input="${e => {
                  this.selectFeature = idx;
                  this.setName(e.target.value);
                }}"
              />
              <textarea
                class="text-input"
                placeholder="Description"
                autofill="off"
                autocomplete="off"
                @input="${e => {
                  this.selectFeature = idx;
                  this.setDescription(e.target.value);
                }}"
              >${p.description}</textarea>
              <div>
                <button @click="${(e) => {
                  document.querySelectorAll(".marker-form")[idx].style.display = "none";
                  document.querySelectorAll(".marker-expand")[idx].style.display = "inline-block";
                }}">Close</button>
                <button @click="${(e) => {
                  const yn = window.confirm("Would you like to remove this place?");
                  if (yn) {
                    this.selectFeature = idx;
                    this.onDelete();
                  }
                }}">Delete?</button>
              </div>
            </div>
          </li>
        `)}
        <li>
          <button
            @click="${() => {
              document.querySelector("#tool-pan").click();
              document.querySelectorAll(".marker-form").forEach((m, idx2) => {
                m.style.display = "none";
              })
              document.querySelectorAll(".marker-expand").forEach((m, idx2) => {
                m.style.display = "inline-block";
              })
              document.querySelector(".mapboxgl-control-container .mapbox-gl-draw_point").click()
            }}"
          >
            New Marker
          </button>
          - then click place on map
        </li>
    </ul>`;
    }
}
