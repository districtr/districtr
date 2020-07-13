import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import { actions } from "../reducers/charts";
import Parameter from "../components/Parameter";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import IncomeHistogramTable from "../components/Charts/IncomeHistogramTable";
import DemographicsTable from "../components/Charts/DemographicsTable";
import LayerTab from "../components/LayerTab";
import Layer, { addBelowLabels } from "../map/Layer";
import { stateNameToFips, COUNTIES_TILESET, spatial_abilities } from "../utils";

const COUNTIES_LAYER = {
    id: "counties",
    source: COUNTIES_TILESET.sourceLayer,
    "source-layer": COUNTIES_TILESET.sourceLayer,
    type: "line",
    paint: {
        "line-color": "#444444",
        "line-width": [
            "interpolate",
            ["linear"],
            ["zoom"],
            0,
            0,
            4,
            1,
            6,
            2,
            9,
            3
        ],
        "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 9, 0.5]
    }
};

export function addCountyLayer(tab, state) {
    let startFill = window.location.search.includes("county=true") ? 0.4 : 0;
    const counties = new Layer(
        state.map,
        {
            ...COUNTIES_LAYER,
            paint: { ...COUNTIES_LAYER.paint, "line-opacity": startFill },
            filter: [
                "==",
                ["get", "STATEFP"],
                String(stateNameToFips[(state.place.state || state.place.id).toLowerCase()])
            ]
        },
        addBelowLabels
    );
    if (stateNameToFips[(state.place.state || state.place.id).toLowerCase()]) {
        tab.addSection(
            () => html`
                <h4>Counties</h4>
                ${toggle(`Show county boundaries`, false, checked =>
                    counties.setOpacity(
                        checked ? COUNTIES_LAYER.paint["fill-opacity"] : 0
                    ),
                    "countyVisible"
                )}
            `
        );
    }
}

const amin_type = (window.location.search.split("amin=")[1] || "").split("&")[0] || "shades";
let shadeNames = ["case"];
const amin_paint = ({
  grey: {
    "fill-outline-color": "#444444",
    "fill-color": "#444444",
    "fill-opacity": 0.3
  },
  gray: {
    "fill-outline-color": "#444444",
    "fill-color": "#444444",
    "fill-opacity": 0.3
  },
  brown: {
    "fill-outline-color": "#654321",
    "fill-color": "rgb(178,172,112)",
    "fill-opacity": 0.3
  },
  brown2: {
    "fill-outline-color": "rgb(178,172,112)",
    "fill-color": "rgb(178,172,112)",
    "fill-opacity": 0.3
  },
  brown3: {
    "fill-outline-color": "#654321",
    "fill-color": "rgb(178,172,112)",
    "fill-opacity": 0.3
  },
  shades: {
    "fill-outline-color": "#000",
    "fill-color": shadeNames,
    "fill-opacity": 0.15
  },
  lines: {
    "fill-pattern": "hatching",
    "fill-color": "#000",
    "fill-opacity": 0.7
  }
})[amin_type];

const AMERINDIAN_LAYER = {
    id: "nativeamerican",
    source: "nativeamerican",
    type: "fill",
    paint: amin_paint
};

export function addAmerIndianLayer(tab, state) {
    let nativeamerican = null,
        nativeamerican_labels = null,
        startFill = (window.location.search.includes("native=true") || window.location.search.includes("amin=")) ? 0.15 : 0;

    let native_am_type = "Pueblos, Tribes, and Nations"; // NM
    if (state.place.id === "alaska") {
        native_am_type = "Alaskan Native Communities";
    } else if (["california"].includes(state.place.id)) {
        native_am_type = "Indian Communities";
    } else if (["alabama", "colorado", "florida", "georgia", "idaho", "iowa", "kansas", "louisiana", "nebraska", "southcarolina", "southdakota", "virginia", "wisconsin", "wyoming"].includes(state.place.id)) {
        native_am_type = "Tribes";
    } else if (["montana", "oregon"].includes(state.place.id)) {
        native_am_type = "Tribal Nations";
    } else if (state.place.id === "hawaii") {
        native_am_type = "Hawaiian Home Lands";
    } else if (state.place.id === "oklahoma") {
        native_am_type = "Indian Country";
    } else if (["connecticut", "delaware", "maine", "nevada", "newyork", "utah"].includes(state.place.id)) {
        native_am_type = "Indian Tribes";
    } else if (state.place.id === "texas") {
        native_am_type = "Indian Nations";
    } else if (["michigan", "minnesota"].includes(state.place.id)) {
        native_am_type = "Tribal Governments";
    } else if (["ma", "rhode_island", "washington", "arizona"].includes(state.place.id) || (state.place.state === "Arizona")) {
        native_am_type = "Nations and Tribes";
    } else if (["nc", "newjersey"].includes(state.place.id)) {
        native_am_type = "Tribal Communities";
    } else if (state.place.id === "northdakota") {
        native_am_type = "Tribes and Communities";
    }

    const shared_az = {
        maricopa: "arizona",
        nwaz: "arizona",
        seaz: "arizona",
        yuma: "arizona",
        phoenix: "arizona",
    };
    fetch(`/assets/native_official/${shared_az[state.place.id] || state.place.id}.geojson`)
        .then(res => res.json())
        .then((geojson) => {

        let knownNames = new Set(), r, g, b;
        geojson.features.forEach((space, index) => {
            if (index % 20 === 0) {
                r = 50,
                g = 70,
                b = 150
            }
            let name = space.properties.NAME;
            if (!knownNames.has(name)) {
                shadeNames.push(["==", ["get", "NAME"], name]);
                knownNames.add(name);
                knownNames.add(`rgb(${r},${g},${b})`);
                r += 6;
                g += 22;
                b -= 26;
                if (g > 170) {
                    g = 70;
                }
                if (b < 80) {
                    b = 150;
                }
                shadeNames.push(`rgb(${r},${g},${b})`);
            }
        });
        shadeNames.push("#ddd");

        state.map.addSource('nativeamerican', {
            type: 'geojson',
            data: geojson
        });

        if (amin_type === "brown3" || amin_type === "shades") {
            fetch(`/assets/native_official/${shared_az[state.place.id] || state.place.id}_centroids.geojson`)
                .then(res => res.json())
                .then((centroids) => {

                state.map.addSource('nat_centers', {
                    type: 'geojson',
                    data: centroids
                });

                nativeamerican_labels = new Layer(
                    state.map,
                    {
                      id: 'nat-labels',
                      type: 'symbol',
                      source: 'nat_centers',
                      layout: {
                        'text-field': [
                            'format',
                            '\n',
                            {},
                            ['get', 'NAME'],
                            {'font-scale': 0.75},
                            '\n\n',
                            {}
                        ],
                        'text-anchor': 'center',
                        // 'text-ignore-placement': true,
                        'text-radial-offset': 0,
                        'text-justify': 'center'
                      },
                      paint: {
                        'text-opacity': (startFill ? 1 : 0)
                      }
                    },
                    addBelowLabels
                );
            });
        }

        state.map.loadImage("/assets/crosshatch.png", (err, hatching) => {
            if (!err) {
                state.map.addImage("hatching", hatching);
            }

            nativeamerican = new Layer(
                state.map,
                {
                    ...AMERINDIAN_LAYER,
                    paint: { ...AMERINDIAN_LAYER.paint, "fill-opacity": startFill }
                },
                addBelowLabels
            );

            if (amin_type === "brown2" || amin_type === "brown3") {
                new Layer(
                    state.map,
                    {
                        type: "line",
                        source: "nativeamerican",
                        id: "nativeborder",
                        paint: {
                          'line-color': '#654321',
                          'line-opacity': 0.5,
                          'line-width': 4
                        }
                    },
                    addBelowLabels
                );
            }
        });
    });

    tab.addSection(
        () => html`
            <h4>
              Native American Areas
              <small> -&nbsp;Census&nbsp;(AIANNH)</small>
            </h4>
            ${toggle("Show " + native_am_type, false, (checked) => {
                nativeamerican.setOpacity(
                    checked ? AMERINDIAN_LAYER.paint["fill-opacity"] : 0
                );
                if (nativeamerican_labels) {
                    nativeamerican_labels.setOpacity(checked ? 1 : 0, true);
                }
            })}
        `
    );
}

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
            ${(["chicago_community_areas"].includes(state.units.sourceId)
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

    if (spatial_abilities(state.place.id).native_american) {
        addAmerIndianLayer(tab, state);
    }

    // Right now we're doing all of these if statements,
    // but in the future we should just be able to register
    // layer types for different columnSet types and have
    // that determine what is rendered.

    window.coalitionGroups = {};
    let coalitionOverlays = [],
        vapEquivalents = {
          NH_WHITE: 'WVAP',
          NH_BLACK: 'BVAP',
          HISP: 'HVAP',
          NH_ASIAN: 'ASIANVAP',
          NH_AMIN: 'AMINVAP',
          NH_NHPI: 'NHPIVAP',
          'NH_2MORE': '2MOREVAP',
          NH_OTHER: 'OTHERVAP'
        };

    tab.addSection(
        (uiState, dispatch) => html`
          <h4>Forming Coalitions</h4>
          ${Parameter({
              label: "Components:",
              element: html`<div>
                  ${state.population.subgroups.map(sg => html`<div style="display:inline-block;border:1px solid silver;padding:4px;border-radius:4px;cursor:pointer;">
                      ${toggle(sg.name.replace(" population", ""), false, checked => {
                          window.coalitionGroups[sg.key] = checked;
                          window.coalitionGroups[vapEquivalents[sg.key]] = checked;
                          coalitionOverlays.forEach(cat => cat.overlay.repaint());
                          // dispatch(actions.selectCoalitionPop({
                          //     chart: chartId,
                          //     subgroup: sg
                          // }))
                        },
                        "toggle_" + sg.key
                      )}
                  </div>`)}
              </div>`
          })}
        `
    );

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        demoLayers.filter(lyr => !lyr.background),
        state.population,
        "Show demographics",
        false, // first only (one layer)?
        "Coalition population" // coalition subgroup
    );
    coalitionOverlays.push(demographicsOverlay);

    tab.addSection(
        () => html`
            <h4>Demographics</h4>
            ${demographicsOverlay.render()}
        `
    );

    if (state.vap) {
        const vapOverlay = new OverlayContainer(
            "vap",
            demoLayers.filter(lyr => !lyr.background),
            state.vap,
            "Show VAP demographics",
            false,
            "Coalition voting age population"
        );
        coalitionOverlays.push(vapOverlay);

        tab.addSection(
            () =>
                html`
                    <h4>Voting Age Population</h4>
                    ${vapOverlay.render()}
                `
        );
    }

    if (state.incomes) {
        if (state.place.state === "Arizona") {
            const incomeOverlay = new OverlayContainer(
                "income",
                state.layers.filter(lyr => lyr.id.includes("bgs")),
                state.incomes,
                "Map median income (by block group)",
                true // first layer only
            );

            tab.addSection(
                (uiState, dispatch) =>  html`<h4>Household Income</h4>
                <div>
                    ${incomeOverlay.render()}
                </div>`
            );
        } else {
            tab.addSection(
                (uiState, dispatch) =>  html`<h4>Household Income</h4>
                <div>
                    <div class="centered">
                      <strong>Histogram</strong>
                    </div>
                    ${IncomeHistogramTable(
                        "Income Histograms",
                        state.incomes,
                        state.activeParts,
                        uiState.charts["Income Histograms"],
                        dispatch
                    )}
                </div>`
            );
        }
    }

    if (state.rent) {
        tab.addSection(
            (uiState, dispatch) => html`<h4>Homeowner or Renter</h4>
            <div class="sectionThing">
                ${DemographicsTable(
                    state.rent.subgroups,
                    state.activeParts
                )}
            </div>`
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
        tab.addSection(
            () => html`
                <div class="option-list__item">
                    ${partisanOverlays.render()}
                </div>
            `
        );
    }

    toolbar.addTab(tab);
}
