import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import AgeHistogramTable from "../components/Charts/AgeHistogramTable";
import IncomeHistogramTable from "../components/Charts/IncomeHistogramTable";
import DemographicsTable from "../components/Charts/DemographicsTable";

import LayerTab from "../components/LayerTab";
import Layer, { addBelowLabels } from "../map/Layer";
import { stateNameToFips, COUNTIES_TILESET, spatial_abilities } from "../utils";

// NC Native Am: https://ncadmin.nc.gov/public/american-indians/map-nc-tribal-communities

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
    tab.addSection(
        () => html`
            ${toggle(`Show county boundaries`, false, checked =>
                counties.setOpacity(
                    checked ? COUNTIES_LAYER.paint["fill-opacity"] : 0
                ),
                "countyVisible"
            )}
        `
    );
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
    } else if (state.place.id === "california") {
        native_am_type = "Indian Communities";
    } else if (["alabama", "colorado", "florida", "georgia", "idaho", "iowa", "kansas", "louisiana", "nebraska", "southcarolina", "southdakota", "virginia", "wisconsin", "wyoming"].includes(state.place.id)) {
        native_am_type = "Tribes";
    } else if (["arizona", "montana", "oregon"].includes(state.place.id)) {
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
    } else if (["ma", "rhode_island", "washington"].includes(state.place.id)) {
        native_am_type = "Nations and Tribes";
    } else if (["nc", "newjersey"].includes(state.place.id)) {
        native_am_type = "Tribal Communities";
    } else if (state.place.id === "northdakota") {
        native_am_type = "Tribes and Communities";
    }

    fetch(`/assets/native_official/${state.place.id}.geojson`)
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
            fetch(`/assets/native_official/${state.place.id}_centroids.geojson`)
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

export default function MultiLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const tab = new LayerTab("layers", "All Layers", editor.store);

    tab.addSection(() => html`<h3 style="margin-bottom:0">Boundaries</h3>`);

    if (state.place.state === state.place.name) {
        addCountyLayer(tab, state);
    }

    if (spatial_abilities(state.place.id).native_american) {
        addAmerIndianLayer(tab, state);
    }

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
            state.layers,
            state.elections
        );
        tab.addSection(
            () => html`
                <h3 style="margin-bottom:0">
                  Election Results
                  <br/>
                  <small>by VTD</small>
                </h3>
                <div class="sectionThing">
                    <div class="option-list__item">
                        ${partisanOverlays.render()}
                    </div>
                </div>
            `
        );
    }

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        state.layers,
        state.population,
        "Map population by race"
    );
    tab.addSection(
        () => html`
        <h3 style="margin-bottom:0">
          Demographics (2018 ACS)
          <br/>
          <small>by blockgroup</small>
        </h3>
        <div class="sectionThing">
            <h4>Race</h4>
            ${demographicsOverlay.render()}
        </div>`
    );

    if (state.vap) {
        const vapOverlays = new OverlayContainer(
            "vap",
            state.layers,
            state.vap,
            "Show VAP demographics"
        );
        tab.addSection(
            () =>
                html`
                    <h4>Voting Age Population</h4>
                    ${vapOverlays.render()}
                `
        );
    }

    if (state.incomes) {
        const incomeOverlay = new OverlayContainer(
            "income",
            state.layers,
            state.incomes,
            "Map median income",
            true // first layer only
        );
        tab.addSection(
            (uiState, dispatch) =>  html`<div class="sectionThing">
                <h4>Household Income</h4>
                ${incomeOverlay.render()}
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

    if (state.rent) {
        tab.addSection(
            (uiState, dispatch) => html`<div class="sectionThing">
                <h4>Homeowner or Renter</h4>
                ${DemographicsTable(
                    state.rent.subgroups,
                    state.activeParts
                )}
            </div>`
        );
    }

    if (state.broadband) {
        tab.addSection(
            (uiState, dispatch) => html`<div class="sectionThing">
                <h4>Broadband</h4>
                <table class="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>With Broadband</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${state.activeParts.map(part => html`<tr>
                        <td>
                          ${part.renderLabel()}
                        </td>
                        <td class="ui-data">
                          ${((Math.round(1000 * state.broadband.subgroups[0].data[part.id] / state.population.subgroups[0].total.data[part.id]) / 10) || 0).toFixed(1)}%
                        </td>
                      </tr>`
                    )}
                  </tbody>
                </table>
            </div>`
        );
    }

    if (state.ages) {
        tab.addSection(
            (uiState, dispatch) => html`<div class="sectionThing">
                <h4>Age</h4>
                <div class="centered">
                  <strong>Youngest to Oldest</strong>
                </div>
                ${AgeHistogramTable(
                    "Age Histograms",
                    state.ages,
                    state.activeParts,
                    uiState.charts["Age Histograms"],
                    dispatch
                )}
            </div>`
        );
    }

    toolbar.addTab(tab);
}
