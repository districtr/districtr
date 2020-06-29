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
            ${toggle(`Show County Boundaries`, false, checked =>
                counties.setOpacity(
                    checked ? COUNTIES_LAYER.paint["fill-opacity"] : 0
                ),
                "countyVisible"
            )}
        `
    );
}


function addCurrentDistricts(tab, state) {
    let borders = {};
    fetch(`/assets/${state.place.id}/fed_districts.geojson?v=2`).then(res => res.json()).then((fed) => {
    fetch(`/assets/${state.place.id}/state_house_districts.geojson`).then(res => res.json()).then((state_house) => {
    fetch(`/assets/${state.place.id}/state_senate_districts.geojson`).then(res => res.json()).then((state_senate) => {

        state.map.addSource('fed_districts', {
            type: 'geojson',
            data: fed
        });
        state.map.addSource('state_house', {
            type: 'geojson',
            data: state_house
        });
        state.map.addSource('state_senate', {
            type: 'geojson',
            data: state_senate
        });

        borders.federal = new Layer(
            state.map,
            {
                id: 'fed_districts',
                type: 'line',
                source: 'fed_districts',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1
                }
            },
            addBelowLabels
        );
        borders.senate = new Layer(
            state.map,
            {
                id: 'state_senate',
                type: 'line',
                source: 'state_senate',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1
                }
            },
            addBelowLabels
        );
        borders.house = new Layer(
            state.map,
            {
                id: 'state_house',
                type: 'line',
                source: 'state_house',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1
                }
            },
            addBelowLabels
        );
    })})});

    let currentBorder = null;
    let showBorder = (lyr) => {
        if (currentBorder) {
            currentBorder.setOpacity(0);
        }
        if (lyr) {
            lyr.setOpacity(0.8);
        }
        currentBorder = lyr;
    };

    tab.addSection(() => html`
        <h4>Current Districts</h4>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="none" checked="true" @change="${e => showBorder()}"/>
            None
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="fed" @change="${e => showBorder(borders.federal)}"/>
            US Congress
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="senate" @change="${e => showBorder(borders.senate)}"/>
            State Senate
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="house" @change="${e => showBorder(borders.house)}"/>
            State House
          </label>
        </li>
    `);
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

    tab.addSection(
        () => html`
            ${toggle("Show Communities", true, checked => {
                let opacity = checked ? 0.8 : 0;
                state.units.setOpacity(opacity);
            })}`
    );

    if (state.place.state === state.place.name) {
        addCountyLayer(tab, state);
    }
    if (spatial_abilities(state.place.id).native_american) {
        addAmerIndianLayer(tab, state);
    }

    if (spatial_abilities(state.place.id).current_districts) {
        addCurrentDistricts(tab, state);
    }

    let emitters, coal, colleges, hospitals = null;

    fetch("/assets/nc/nc-ccr.csv").then(res => res.text()).then(txt => {
      let gjf = []
      txt.split("\n").forEach((row) => {
        // console.log(row.split(","))
        row = row.split(",")
        if (row.length > 1) {
          let lat = row[row.length - 2] * 1,
              lng = row[row.length - 1] * 1
          gjf.push({
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [lng, lat]
            }
          })
        }
      })
      state.map.addSource('coal', {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: gjf
        }
      })
      coal = new Layer(
        state.map,
        {
           id: "coal",
           source: "coal",
           type: "circle",
           paint: {
             'circle-opacity': 0,
             'circle-radius': 4,
             'circle-color': 'black'
           }
        }
      )
    });
    fetch("/assets/nc/nc_industry.geojson").then(res => res.json()).then(gj => {
      state.map.addSource('emitters', {
        type: "geojson",
        data: gj
      });
      emitters = new Layer(
        state.map,
        {
          id: "emitters",
           source: "emitters",
           type: "circle",
           paint: {
            'circle-radius': 4,
            'circle-opacity': 0,
            'circle-color': [
              'match',
              ['get', 'CLASS_STATUS'],
              'Title V', 'purple',
              'Synthetic Minor', 'green',
              'Small', 'red',
              'Permit Exempt', 'blue',
              'Registered', 'orange',
              'Permit/Registration Pending', 'yellow',
              '#ccc' // other
            ]
          }
        },
        addBelowLabels
      )
    });
    fetch("/assets/nc/nc_colleges.geojson").then(res => res.json()).then(gj => {
      state.map.addSource('colleges', {
        type: "geojson",
        data: gj
      });
      colleges = new Layer(
        state.map,
        {
           id: "colleges",
           source: "colleges",
           type: "circle",
           paint: {
             'circle-radius': 4,
             'circle-opacity': 0,
             'circle-color': 'blue'
           }
        }
      );
    });
    fetch("/assets/nc/nc_hospitals.geojson").then(res => res.json()).then(gj => {
      state.map.addSource('hospitals', {
        type: "geojson",
        data: gj
      });
      hospitals = new Layer(
        state.map,
        {
           id: "hospitals",
           source: "hospitals",
           type: "circle",
           paint: {
             'circle-radius': 4,
             'circle-opacity': 0,
             'circle-color': 'red'
           }
        }
      );
    });

    tab.addSection(
        () => html`<h3 style="margin-bottom:0">
          Environment
          <br/>
          <small>NC Dept of Environmental Quality</small>
        </h3>
        <div class="sectionThing">
            ${toggle(`Show air permits`, false, checked =>
                emitters.setOpacity(checked ? 1 : 0),
                "emittersVisible"
            )}
            ${toggle(`Show coal ash ponds`, false, checked =>
                coal.setOpacity(checked ? 1 : 0),
                "coalVisible"
            )}
        </div>`
    );
    tab.addSection(
        () => html`<h3 style="margin-bottom:0">
          Infrastructure
        </h3>
        <div class="sectionThing">
            ${toggle(`Show colleges`, false, checked =>
                colleges.setOpacity(checked ? 1 : 0),
                "collegesVisible"
            )}
            ${toggle(`Show hospitals`, false, checked =>
                hospitals.setOpacity(checked ? 1 : 0),
                "hospitalsVisible"
            )}
        </div>`
    );

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
            state.layers.filter(lyr => lyr.id === "extra-precincts"),
            state.elections
        );
        let registerOverlays = null;
        if (state.voters) {
            registerOverlays = new OverlayContainer(
                "registered_voters",
                state.layers.filter(lyr => lyr.id === "extra-precincts_new"),
                state.voters
            );
        }
        tab.addSection(
            () => html`
                <h3 style="margin-bottom:0">
                  Voting Records
                  <small>- by VTD</small>
                </h3>
                <div class="sectionThing">
                    <div class="option-list__item">
                        ${partisanOverlays.render()}
                    </div>
                    <hr/>
                    <div class="option-list__item">
                        ${registerOverlays ? registerOverlays.render() : null}
                    </div>
                </div>
            `
        );
    }

    const demographicsOverlay = new OverlayContainer(
        "demographics",
        state.layers.filter(lyr => lyr.id.includes("blockgroups") || lyr.type === "circle"),
        state.population,
        "Map population by race"
    );
    tab.addSection(
        () => html`
        <h3 style="margin-bottom:0">
          Demographics (2018 ACS)
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
            state.layers.filter(lyr => lyr.id.includes("blockgroups")),
            state.incomes,
            "Map median income",
            true // first layer only
        );

        const snapOverlay = new OverlayContainer(
            "snap",
            state.layers.filter(lyr => lyr.id.includes("tract")),
            state.snap,
            "SNAP Households (2015)"
        );

        tab.addSection(
            (uiState, dispatch) =>  html`<h4>Household Income and SNAP</h4>
            <div class="sectionThing">
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
                ${snapOverlay.render()}
            </div>`
        );
    }

    if (state.education) {
        const eduOverlay = new OverlayContainer(
            "education",
            state.layers.filter(lyr => lyr.id.includes("blockgroups") || lyr.type === "circle"),
            state.education,
            "Map Education Level",
            true
        );
        tab.addSection(
            (uiState, dispatch) => html`<h4>Education</h4>
            <div class="sectionThing">
                ${eduOverlay.render()}
                ${DemographicsTable(
                    state.education.subgroups,
                    state.activeParts
                )}
            </div>`
        );
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

    if (state.broadband) {
        tab.addSection(
            (uiState, dispatch) => html`<h4>Broadband</h4>
            <div class="sectionThing">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th></th>
                      <th>With Computers</th>
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
                        <td class="ui-data">
                          ${((Math.round(1000 * state.broadband.subgroups[1].data[part.id] / state.population.subgroups[0].total.data[part.id]) / 10) || 0).toFixed(1)}%
                        </td>
                      </tr>`
                    )}
                  </tbody>
                </table>
            </div>`
        );
    }

    if (state.asthma) {
        const asthmaOverlay = new OverlayContainer(
            "asthma",
            state.layers.filter(lyr => lyr.id.includes("tract")),
            state.asthma,
            "Asthma (only select cities)",
            true
        );
        tab.addSection(() => html`<h4>
          Health
          <small>by tract</small>
        </h4>
        <div class="sectionThing">
            ${asthmaOverlay.render()}
        </div>`)
    }

    // if (state.ages) {
    //     tab.addSection(
    //         (uiState, dispatch) => html`<h4>Age</h4>
    //         <div class="centered">
    //           <strong>Youngest to Oldest</strong>
    //         </div>
    //         <div class="sectionThing">
    //             ${AgeHistogramTable(
    //                 "Age Histograms",
    //                 state.ages,
    //                 state.activeParts,
    //                 uiState.charts["Age Histograms"],
    //                 dispatch
    //             )}
    //         </div>`
    //     );
    // }

    toolbar.addTab(tab);
}
