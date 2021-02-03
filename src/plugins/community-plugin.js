import { PivotTable } from "../components/Charts/PivotTable";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";
import IncomeHistogramTable from "../components/Charts/IncomeHistogramTable";
import OverlayContainer from "../layers/OverlayContainer";
import DemographicsTable from "../components/Charts/DemographicsTable";
import { Tab } from "../components/Tab";
import { actions } from "../reducers/toolbar";
import AboutSection from "../components/AboutSection";
import { spatial_abilities } from "../utils";
import { html } from "lit-html";

export default function CommunityPlugin(editor) {
    const { state, mapState } = editor;

    addLocationSearch(mapState);

    const tab = new Tab("community", "Drawing", editor.store);
    const about = new AboutSection(editor);
    tab.addRevealSection("Areas of Interest", about.render);

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

    if (state.incomes) {
        if (["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes(state.place.id)) {
            const incomeOverlay = new OverlayContainer(
                "income",
                state.layers.filter(lyr => lyr.id.includes("bgs")),
                state.incomes,
                "Map median income (by block group)",
                true // first layer only
            );

            evaluationTab.addRevealSection(
                'Household Income',
                (uiState, dispatch) =>  html`<div>
                    ${incomeOverlay.render()}
                </div>`,
                {
                  isOpen: false
                }
            );
        } else {
            evaluationTab.addRevealSection(
                'Household Income',
                (uiState, dispatch) =>  html`<div>
                    ${IncomeHistogramTable(
                        "Income Histograms",
                        state.incomes,
                        state.activeParts,
                        uiState.charts["Income Histograms"],
                        dispatch
                    )}
                </div>`,
                {
                  isOpen: false
                }
            );
        }
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
