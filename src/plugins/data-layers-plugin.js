import { html, render } from "lit-html";
import { toggle } from "../components/Toggle";
import { actions } from "../reducers/charts";
import Parameter from "../components/Parameter";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import IncomeHistogramTable from "../components/Charts/IncomeHistogramTable";
import DemographicsTable from "../components/Charts/DemographicsTable";
import LayerTab from "../components/LayerTab";
import Layer, { addBelowLabels } from "../map/Layer";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";

import { addAmerIndianLayer } from "../layers/amin_control";
import { addCountyLayer } from "../layers/counties";
import { spatial_abilities } from "../utils";

export default function DataLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const tab = new LayerTab("layers", "Data Layers", editor.store);

    const demoLayers = window.mapslide ? state.swipeLayers : state.layers;

    const districtsHeading =
        state.plan.problem.type === "community" ? "Communities" : "Districts";
    const districtMessage =
        state.plan.problem.type === "community"
            ? "Show my communities"
            : "Show districts";
    const districtNumberLabel = "Show " + (state.plan.problem.type === "community" ? "community" : "district")
        + " numbers";
    tab.addSection(
        () => html`
            <h4>${districtsHeading}</h4>
            ${toggle(districtMessage, true, checked => {
                let opacity = checked ? 0.8 : 0;
                state.units.setOpacity(opacity);
            })}
            ${(["chicago_community_areas", "alaska_blockgroups", "hawaii_blockgroups", "oregon_blockgroups",
                "colorado_blockgroups", "iowa_blockgroups", "georgia_blockgroups", "connecticut_blockgroups",
               "maryland_blockgroups", "ma_blockgroups", "michigan_blockgroups", "minnesota_blockgroups",
             "new_mexico_blockgroups", "pennsylvania_blockgroups", "texas_blockgroups", "vermont_blockgroups",
           "wisconsin_blockgroups", "virginia_blockgroups", "rhode_island_blockgroups", "utah_blockgroups",
            "ohio_blockgroups", "oklahoma_blockgroups", "arizona_blockgroups", "delaware_blockgroups",
              "maine_blockgroups", "louisiana_blockgroups"].includes(state.units.sourceId)
              || !spatial_abilities(state.place.id).number_markers
            ) ? null
                : toggle(districtNumberLabel, false, checked => {
                    let opacity = checked ? 1 : 0;
                    state.numbers.forEach((number) => {
                        number.setOpacity(Math.round(opacity))
                    });
                }, "toggle-district-numbers")}
        `
    );

    if (state.place.state === state.place.name) {
        addCountyLayer(tab, state);
    }

    if (state.plan.problem.type === "community" && spatial_abilities(state.place.id).neighborhoods) {
        const noNames = ["case",
            ["==", ["get", "type"], "neighborhood"],
            "",
            ["==", ["get", "type"], "neighbourhood"],
            "",
            ["==", ["get", "type"], "locality"],
            "",
            [">=", ["get", "admin_level"], 8],
            "",
            ["==", ["get", "type"], "block"],
            "",
            ["get", "name"]];
        state.map.setLayoutProperty('settlement-subdivision-label', 'text-field', noNames);
        tab.addSection(() => toggle("Suggest neighborhood names", false, checked => {
            state.map.setLayoutProperty('settlement-subdivision-label', 'text-field', checked ? ["get", "name"]
                : noNames);
        }));
    }

    if (state.place.id === "miamidade") {
        let miami = null;
        fetch("/assets/city_border/miamifl.geojson").then(res => res.json()).then((border) => {
            state.map.addSource('city_border', {
                type: 'geojson',
                data: border
            });

            miami = new Layer(
                state.map,
                {
                    id: "city_border",
                    source: "city_border",
                    type: "line",
                    paint: {
                        "line-color": "#000",
                        "line-opacity": 0.7,
                        "line-width": 1.5
                    }
                }
            );
        });

        tab.addSection(
            () => html`
                <h4>City of Miami</h4>
                ${toggle("Show boundary", true, (checked) => {
                    miami.setOpacity(
                        checked ? 0.7 : 0
                    );
                })}
            `
        );
    }

    if (state.place.id === "forsyth_nc") {
        let fnc_layer;
        fetch(`/assets/current_districts/forsyth_nc_muni.geojson`).then(res => res.json()).then((fnc) => {
            state.map.addSource('fnc', {
                type: 'geojson',
                data: fnc
            });

            fnc_layer = new Layer(state.map,
                {
                    id: 'fnc',
                    source: 'fnc',
                    type: 'line',
                    paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                },
                addBelowLabels
            );
        });
        tab.addRevealSection(
            'Show Boundary',
            (uiState, dispatch) => html`
            ${toggle("Winston-Salem", false, checked => {
                let opacity = checked ? 1 : 0;
                fnc_layer && fnc_layer.setOpacity(opacity);
            })}`,
            {
                isOpen: false
            }
        );

    }

    if (["virginia", "lax"].includes(state.place.id)) {
        let plan2010, plan2013, ush;
        fetch(`/assets/current_districts/${state.place.id}_2010.geojson`).then(res => res.json()).then((va2010) => {
            state.map.addSource('va2010', {
                type: 'geojson',
                data: va2010
            });

            plan2010 = new Layer(state.map,
                {
                    id: 'va2010',
                    source: 'va2010',
                    type: 'line',
                    paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                },
                addBelowLabels
            );

            if (state.place.id === "virginia") {
                fetch("/assets/current_districts/virginia_2013.geojson").then(res => res.json()).then((va2013) => {
                    state.map.addSource('va2013', {
                        type: 'geojson',
                        data: va2013
                    });

                    plan2013 = new Layer(state.map,
                        {
                            id: 'va2013',
                            source: 'va2013',
                            type: 'line',
                            paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                        },
                        addBelowLabels
                    );
                });
            } else if (state.place.id === "lax") {
                fetch("/assets/current_districts/lax_senate.geojson").then(res => res.json()).then((va2013) => {
                    state.map.addSource('va2013', {
                        type: 'geojson',
                        data: va2013
                    });

                    plan2013 = new Layer(state.map,
                        {
                            id: 'va2013',
                            source: 'va2013',
                            type: 'line',
                            paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                        },
                        addBelowLabels
                    );
                });
                fetch("/assets/current_districts/lax_congress.geojson").then(res => res.json()).then((lax_ush) => {
                    state.map.addSource('lax_ush', {
                        type: 'geojson',
                        data: lax_ush
                    });

                    ush = new Layer(state.map,
                        {
                            id: 'lax_ush',
                            source: 'lax_ush',
                            type: 'line',
                            paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                        },
                        addBelowLabels
                    );
                });
            }
        });

        if (state.place.id === "virginia") {
            tab.addRevealSection(
                'Enacted Plans',
                (uiState, dispatch) => html`
                ${toggle("2003-2013 Congressional Plan", false, checked => {
                    let opacity = checked ? 1 : 0;
                    plan2010 && plan2010.setOpacity(opacity);
                })}
                ${toggle("2013-2017 Congressional Plan", false, checked => {
                    let opacity = checked ? 1 : 0;
                    plan2013 && plan2013.setOpacity(opacity);
                })}`,
                {
                    isOpen: false
                }
            );
        } else {
            tab.addRevealSection(
                'Enacted Plans',
                (uiState, dispatch) => html`
                ${toggle("State Assembly", false, checked => {
                    let opacity = checked ? 1 : 0;
                    plan2010 && plan2010.setOpacity(opacity);
                })}
                ${toggle("State Senate", false, checked => {
                    let opacity = checked ? 1 : 0;
                    plan2013 && plan2013.setOpacity(opacity);
                })}
                ${toggle("US House", false, checked => {
                    let opacity = checked ? 1 : 0;
                    ush && ush.setOpacity(opacity);
                })}`,
                {
                    isOpen: false
                }
            );
        }
    }

    if (spatial_abilities(state.place.id).native_american) {
        addAmerIndianLayer(tab, state);
    }

    tab.addSection(() => html`<h4>Demographics</h4>`)

    let coalitionOverlays = [];
    if (spatial_abilities(state.place.id).coalition) {
        window.coalitionGroups = {};
        let vapEquivalents = {
          NH_WHITE: 'WVAP',
          NH_BLACK: 'BVAP',
          HISP: 'HVAP',
          NH_ASIAN: 'ASIANVAP',
          NH_AMIN: 'AMINVAP',
          NH_NHPI: 'NHPIVAP',
          'NH_2MORE': '2MOREVAP',
          NH_OTHER: 'OTHERVAP'
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
            "Coalition Builder",
            (uiState, dispatch) => html`
              ${Parameter({
                  label: "",
                  element: html`<div style="margin-top:8px">
                      ${state.population.subgroups.map(sg => html`<div style="display:inline-block;border:1px solid silver;padding:4px;border-radius:4px;cursor:pointer;">
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
                isOpen: true
            }
        );
    }

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        demoLayers.filter(lyr => !lyr.background),
        state.population,
        "Show population",
        false, // first only (one layer)?
        spatial_abilities(state.place.id).coalition ? "Coalition population" : null, // coalition subgroup
        spatial_abilities(state.place.id).multiyear // multiple years
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
            spatial_abilities(state.place.id).coalition ? "Coalition voting age population" : null,
            false // multiple years? not on miami-dade
        );
        coalitionOverlays.push(vapOverlay);
    }

    tab.addRevealSection(
        "Race",
        (uiState, dispatch) => html`
            ${demographicsOverlay.render()}
            ${vapOverlay ? vapOverlay.render() : null}
        `,
        {
            isOpen: true
        }
    );

    if (state.incomes) {
        if (["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes(state.place.id)) {
            const incomeOverlay = new OverlayContainer(
                "income",
                state.layers.filter(lyr => lyr.id.includes("bgs")),
                state.incomes,
                "Map median income (by block group)",
                true // first layer only
            );

            tab.addRevealSection(
                'Household Income',
                (uiState, dispatch) =>  html`<div>
                    ${incomeOverlay.render()}
                </div>`,
                {
                  isOpen: false
                }
            );
        } else {
            tab.addRevealSection(
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
        tab.addRevealSection(
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

    // if (state.ages) {
    //     const ageOverlays = new OverlayContainer(
    //         "ages",
    //         state.layers,
    //         state.ages,
    //         "Show age demographics"
    //     );
    //     tab.addSection(
    //         () =>
    //             html`
    //                 <h4>Age Groups</h4>
    //                 ${ageOverlays.render()}
    //             `
    //     );
    // }

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
            demoLayers,
            state.elections
        );
        tab.addRevealSection('Previous Elections',
            () => html`
                <div class="option-list__item">
                    ${partisanOverlays.render()}
                </div>
            `,
            {
              isOpen: true
            }
        );
    }

    toolbar.addTab(tab);
}
