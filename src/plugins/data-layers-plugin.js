import { html, parts, render } from "lit-html";

import { toggle } from "../components/Toggle";
import { actions } from "../reducers/charts";
import Parameter from "../components/Parameter";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import DemographicsTable from "../components/Charts/DemographicsTable";
import LayerTab from "../components/LayerTab";
import Layer, { addBelowLabels } from "../map/Layer";
import Election from "../models/Election";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";

import { addAmerIndianLayer } from "../layers/amin_control";
import { addCountyLayer } from "../layers/counties";
import { addBoundaryLayer } from "../layers/current_districts";
import { spatial_abilities, nested, one_cd } from "../utils";

export default function DataLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const abilities = spatial_abilities(state.place.id);
    const showVRA = (state.plan.problem.type !== "community") && (abilities.vra_effectiveness);
    const tab = new LayerTab("layers", showVRA ? "Data" : "Data Layers", editor.store);

    const demoLayers = state.layers;

    // uploading a float is expensive so sometimes we x1000 to round to nearest 1000
    if (abilities.divisor) {
      state.divisor = abilities.divisor;
      if (state.population) {
        state.population.columns.forEach(sg => sg.divisor = state.divisor);
      }
      if (state.cvap) {
        state.cvap.columns.forEach(sg => sg.divisor = state.divisor);
      }
    }

    const nonCensusUnit = state.unitsRecord.id !== "blockgroups"
                        && state.unitsRecord.id !== "blockgroups20"
                        && state.unitsRecord.id !== "vtds20";
    const districtsHeading =
        state.plan.problem.type === "community" ? "Communities" : "My Painted Districts";
    const districtMessage =
        state.plan.problem.type === "community"
            ? "Show my communities"
            : "Show painted districts";
    const districtNumberLabel = "Show " + (state.plan.problem.type === "community" ? "community numbers" : "numbering for painted districts");
    tab.addSection(
        () => html`
            <h4>${districtsHeading}</h4>
            ${toggle(districtMessage, true, checked => {
                let opacity = checked ? 0.8 : 0;
                state.units.setOpacity(opacity);
                if (checked) {
                  if (document.getElementById("tool-brush").checked || document.getElementById("tool-eraser").checked) {
                    state.brush.activate();
                  }
                } else {
                  state.brush.deactivate();
                }
            })}
            ${(["chicago_community_areas", "montana_blocks", "wyoming_blocks"].includes(state.units.sourceId)
                || (! abilities.number_markers && nonCensusUnit)
            ) ? null
                : toggle(districtNumberLabel, false, checked => {
                    if (checked) {
                        window.planNumbers.update(state);
                    }
                    let opacity = checked ? 1 : 0;
                    state.numbers.forEach((number) => {
                        number.setOpacity(Math.round(opacity))
                    });
                }, "toggle-district-numbers")}
        `
    );

    let smatch = (name) => {
      return name.toLowerCase().replace(/\s+/g, '').replace('_bg', '').replace('2020', '').replace('_', '');
    };

    if (state.plan.problem.type === "community" && abilities.neighborhoods) {
        const noNames = "";
        state.map.setLayoutProperty('settlement-subdivision-label', 'text-field', noNames);
        state.map.setLayoutProperty('settlement-label', 'text-field', ["case",
            ["==", ["get", "type"], "hamlet"],
            "",
            ["get", "name"]
        ]);

        tab.addSection(() => toggle("Suggest neighborhood names", false, checked => {
            state.map.setLayoutProperty('settlement-subdivision-label', 'text-field', checked ? ["get", "name"]
                : noNames);
            state.map.setLayoutProperty('settlement-label', 'text-field', checked ? ["get", "name"]
                : ["case",
                ["==", ["get", "type"], "hamlet"],
                "",
                ["get", "name"]
            ]);
        }));
    }

    let selectBoundaries = abilities.boundaries || [];
    const showingCounties = smatch(state.place.state) === smatch(state.place.name) || showVRA,
          stateID = state.place.state.toLowerCase().replace(/\s+/g, ""),
          placeID = ["california", "ohio", "texas"].includes(stateID) ? state.place.id : stateID;

    if (abilities.municipalities) {
        selectBoundaries.push({
            path: `municipalities/${stateID}/${placeID}`,
            id: 'census_places',
            centroids: true,
            label: (typeof abilities.municipalities === 'string')
              ? abilities.municipalities : 'Municipalities',
        });
    }
    if (abilities.school_districts) {
      selectBoundaries.push({
          path: `school_districts/${stateID}/${placeID}`,
          id: 'schools',
          centroids: true,
          label: (typeof abilities.school_districts === 'string')
            ? abilities.school_districts : 'School Districts',
      });
    }
    if (abilities.neighborhood_borders) {
      selectBoundaries.push({
          path: `neighborhoods/${stateID}/${placeID}`,
          id: 'neighborhoods',
          centroids: true,
          label: (typeof abilities.neighborhood_borders === 'string')
            ? abilities.neighborhood_borders : 'Neighborhood Associations',
      });
    }
    if (abilities.current_districts) {
      if (["california", "texas"].includes(stateID)) {
          selectBoundaries.push({
              path: `current_districts/${stateID}/${placeID}`,
              id: 'cur_district',
              centroids: false,
              label: (typeof abilities.current_districts === 'string')
                ? abilities.current_districts : 'Current Districts',
          });
      } else {
          if (!one_cd(placeID)) {
            selectBoundaries.push({
                path: `current_districts/${stateID}/us_house`,
                id: 'cur_district_ush',
                centroids: false,
                label: 'US House',
            });
          }
          selectBoundaries.push({
              path: `current_districts/${stateID}/state_senate`,
              id: 'cur_district_ssen',
              centroids: false,
              label: 'State Senate',
              lineWidth: nested(placeID) ? 2 : 1.5,
          });
          selectBoundaries.push({
              path: `current_districts/${stateID}/state_house`,
              id: 'cur_district_sho',
              centroids: false,
              label: 'State House',
              lineColor: nested(placeID) ? '#f00' : '#000',
              lineWidth: nested(placeID) ? 0.75 : 1.5,
          });
      }
    }

    if (selectBoundaries && selectBoundaries.length) {
        tab.addRevealSection(
            'Boundaries',
            (uiState, dispatch) => selectBoundaries.map((config, idx) => {
              if (config.unitType && !state.units.id.includes(config.unitType)) {
                return "";
              }
              return addBoundaryLayer(config, state.map);
            }),
            {
                isOpen: true
            }
        );
    // handle other layers
    } else if (showingCounties || abilities.native_american) {
        tab.addSection(() => html`<h4>Boundaries</h4>`)
    }
    if (showingCounties) {
        addCountyLayer(tab, state);
    }
    if (abilities.native_american) {
        addAmerIndianLayer(tab, state);
    }

    // if (state.problem.type !== "community" && abilities.load_coi) {
    //     addMyCOI(state, tab);
    // }

    tab.addSection(() => html`<h4>Demographics</h4>`)

    if (state.place.id === "alaska_blocks") {
        state.population.subgroups = [];
        state.vap.subgroups = [];
    }

    tab.addRevealSection(
        html`<h5>${(state.population && !state.population.subgroups.length) ? "Population" : "Population by Race"}</h5>`,
        (uiState, dispatch) => html`
            ${state.place.id === "lowell" ? "(“Coalition” = Asian + Hispanic)" : ""}
            ${demographicsOverlay.render()}
            ${vapOverlay ? vapOverlay.render() : null}
            ${(abilities.coalition === false) ? "" : html`<p class="italic-note">*Use the coalition builder to define a collection
            of racial and ethnic groups from the Census. In the other data layers below,
            you'll be able to select the coalition you have defined.</p>`}
        `,
        {
            isOpen: false
        }
    );

    let coalitionOverlays = [];
    if (abilities.coalition !== false) {
        window.coalitionGroups = {};
        let vapEquivalents = {
          NH_WHITE: 'WVAP',
          WHITE: 'WVAP',
          NH_BLACK: 'BVAP',
          BLACK: 'BVAP',
          HISP: 'HVAP',
          NH_ASIAN: 'ASIANVAP',
          ASIAN: 'ASIANVAP',
          NH_AMIN: 'AMINVAP',
          AMIN: 'AMINVAP',
          NH_NHPI: 'NHPIVAP',
          NHPI: 'NHPIVAP',
          'NH_2MORE': '2MOREVAP',
          '2MORE': '2MOREVAP',
          NH_OTHER: 'OTHERVAP',
          OTHER: 'OTHERVAP',
        };

        const coalitionPivot = CoalitionPivotTable(
            "Coalition Builder",
            state.population,
            state.place.name,
            state.parts,
            state.units,
            true // totals only
        );

        tab.addRevealSection(
            html`<h5>Coalition Builder</h5>`,
            (uiState, dispatch) => html`
              ${Parameter({
                  label: "",
                  element: html`<div style="margin-top:8px">
                      ${state.population.subgroups.filter(sg => !sg.total_alt).map(sg => html`<div style="display:inline-block;border:1px solid silver;padding:4px;border-radius:4px;cursor:pointer;">
                          ${toggle(sg.name.replace(" population", ""), false, checked => {
                              window.coalitionGroups[sg.key] = checked;
                              window.coalitionGroups[vapEquivalents[sg.key]] = checked;
                              coalitionOverlays.forEach(cat => cat.overlay.repaint());
                              render(coalitionPivot(uiState, dispatch), document.getElementById("coalition-table"));
                            },
                            "toggle_" + sg.key
                          )}
                      </div>`)}
                  </div>`
              })}
              <div id="coalition-table">
                ${coalitionPivot(uiState, dispatch)}
              </div>
            `,
            {
                isOpen: false
            }
        );
    }

    let supportMultiYear = state.units.id.includes("blockgroup");
    if (state.place.id === "chicago" && state.units.id.includes("precinct")) {
      supportMultiYear = true;
    }

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        demoLayers.filter(lyr => !lyr.background),
        state.population,
        "Show population",
        false, // first only (one layer)?
        (abilities.coalition === false) ? null : "Coalition population*", // coalition subgroup
        (supportMultiYear ? abilities.multiyear : null), // multiple years
        false,
        abilities.purple_demo,
    );
    coalitionOverlays.push(demographicsOverlay);

    let vapOverlay = null;
    if (state.vap) {
        vapOverlay = new OverlayContainer(
            "vap",
            demoLayers.filter(lyr => !lyr.background),
            state.vap,
            "Show voting age population (VAP)",
            false,
            (abilities.coalition === false) ? null : "Coalition voting age population",
            false,
            false,
            abilities.purple_demo,
        );
        coalitionOverlays.push(vapOverlay);
    }
    if (state.cvap) {
        vapOverlay = new OverlayContainer(
            "cvap",
            demoLayers.filter(lyr => !lyr.background),
            state.cvap,
            "Show citizen voting age population (CVAP)",
            false,
            (abilities.coalition === false) ? null : "Coalition citizen voting age population",
            false,
            false,

        );
        coalitionOverlays.push(vapOverlay);
    }

    if (state.median_income || state.rent) {
        let incomeOverlay, rentOverlay;
        if (state.median_income) {
            incomeOverlay = new OverlayContainer(
                "income",
                state.layers.filter(lyr => lyr.id.includes("blockgroups")),
                state.median_income,
                "Show median income",
                true // first layer only
            );
        }
        if (state.rent) {
            let rentElec = new Election(
                "Test",
                state.rent.subgroups,
                state.parts,
            );
            rentOverlay = new PartisanOverlayContainer(
                "partisan",
                demoLayers.filter(lyr => !lyr.background),
                [rentElec],
                toolbar,
                "Show % renter",
            );
        }

        tab.addRevealSection(
            html`Socioeconomic data ${abilities.multiyear
              ? `(${abilities.multiyear})`
              : ""}`,
            (uiState, dispatch) => html`
              ${state.median_income ? incomeOverlay.render() : null}
              ${state.rent ?
                html`${rentOverlay.render()}
                <div class="color-legend" id="color-renter" style="display: block;visibility: hidden;">
                  <span class="gradientbar greenorange"></span>
                  <br>
                  <div class="notches" id="notches-vap">
                      <span class="notch">|</span>
                      <span class="notch">|</span>
                      <span class="notch">|</span>
                      <span class="notch">|</span>
                      <span class="notch">|</span>
                      <span class="notch">|</span>
                  </div>
                  <div id="percents-vap">
                      <span class="square">0%</span>
                      <span class="square">20%</span>
                      <span class="square">40%</span>
                      <span class="square">60%</span>
                      <span class="square">80%</span>
                      <span class="square">100%</span>
                  </div>` : null}
            `, {isOpen: false}
        );
    }

    if (state.elections.length > 0) {
        let partisanLayers = abilities.county_filter
          ? demoLayers.filter(lyr => lyr.sourceId.includes("precincts"))
          : demoLayers;
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
            partisanLayers,
            state.elections,
            toolbar,
            null, // bipolar / rent text
            abilities.county_filter,
        );
        tab.addSection(() => html`<h4>Statewide Elections</h4>
            <div class="option-list__item">
                    ${partisanOverlays.render()}
            </div>`
        );
    }

    if (state.pcts) {
      const pctOverlay = new OverlayContainer(
          "pcts",
          state.layers.filter(lyr => lyr.sourceId.includes("blockgroups")),
          state.pcts,
          "Additional demographics",
          false,
          false,
          null,
          true,
      );
      tab.addSection(() => html`<div class="option-list__item">
                  ${pctOverlay.render()}
          </div>`
      );
    }

    toolbar.addTab(tab);
}
