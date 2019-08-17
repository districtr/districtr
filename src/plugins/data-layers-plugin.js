import { Landmarks } from "../components/Landmark";
import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import OverlayContainer from "../layers/OverlayContainer";
import PartisanOverlayContainer from "../layers/PartisanOverlayContainer";
import LayerTab from "../components/LayerTab";
import Layer, { addBelowLabels } from "../map/Layer";

const COUNTIES_TILESET = {
    sourceLayer: "cb_2018_us_county_500k-6p4p3f",
    source: { type: "vector", url: "mapbox://districtr.6fcd9f0h" }
};

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
    state.map.addSource(COUNTIES_TILESET.sourceLayer, COUNTIES_TILESET.source);
    const counties = new Layer(
        state.map,
        {
            ...COUNTIES_LAYER,
            paint: { ...COUNTIES_LAYER.paint, "line-opacity": 0 },
            filter: [
                "==",
                ["get", "STATEFP"],
                stateNameToFips[state.place.state]
            ]
        },
        addBelowLabels
    );
    tab.addSection(
        () => html`
            <h4>Counties</h4>
            ${toggle(`Show county boundaries`, false, checked =>
                counties.setOpacity(
                    checked ? COUNTIES_LAYER.paint["line-opacity"] : 0
                )
            )}
        `
    );
}

export default function DataLayersPlugin(editor) {
    const { state, toolbar } = editor;
    const landmarks = state.place.landmarks
        ? new Landmarks(state.map, state.place.landmarks)
        : null;

    const tab = new LayerTab("layers", "Data Layers", editor.store);

    const districtsHeading =
        state.plan.problem.type === "community" ? "Communities" : "Districts";
    const districtMessage =
        state.plan.problem.type === "community"
            ? "Show communities"
            : "Show districts";
    tab.addSection(
        () => html`
            <h4>${districtsHeading}</h4>
            ${toggle(districtMessage, true, checked => {
                if (checked) {
                    state.units.setOpacity(0.8);
                } else {
                    state.units.setOpacity(0);
                }
            })}
        `
    );

    if (landmarks) {
        tab.addSection(
            () => html`
                <h4>Landmarks</h4>
                ${toggle(
                    `Show landmarks`,
                    landmarks.visible,
                    landmarks.handleToggle
                )}
            `
        );
    }

    if (state.place.state === state.place.name) {
        addCountyLayer(tab, state);
    }

    // Right now we're doing all of these if statements,
    // but in the future we should just be able to register
    // layer types for different columnSet types and have
    // that determine what is rendered.

    const demographicsOverlay = new OverlayContainer(
        state.layers,
        state.population,
        "Show demographics"
    );

    tab.addSection(
        () => html`
            <h4>Demographics</h4>
            ${demographicsOverlay.render()}
        `
    );

    if (state.vap) {
        const vapOverlays = new OverlayContainer(
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

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            state.layers,
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

const stateNameToFips = {
    Alaska: "02",
    California: "06",
    Colorado: "08",
    "District of Columbia": "11",
    Idaho: "16",
    Illinois: "17",
    Iowa: "19",
    Kentucky: "21",
    Louisiana: "22",
    Maryland: "24",
    Minnesota: "27",
    Missouri: "29",
    "New York": "36",
    Oregon: "41",
    Tennessee: "47",
    Texas: "48",
    Virginia: "51",
    Wisconsin: "55",
    Alabama: "01",
    Arizona: "04",
    Arkansas: "05",
    Indiana: "18",
    Kansas: "20",
    Maine: "23",
    Connecticut: "09",
    Delaware: "10",
    Georgia: "13",
    Hawaii: "15",
    "South Carolina": "45",
    "South Dakota": "46",
    Massachusetts: "25",
    Michigan: "26",
    Mississippi: "28",
    Nebraska: "31",
    Nevada: "32",
    "New Hampshire": "33",
    "New Jersey": "34",
    "New Mexico": "35",
    "North Carolina": "37",
    "North Dakota": "38",
    "Rhode Island": "44",
    Ohio: "39",
    Oklahoma: "40",
    Pennsylvania: "42",
    Florida: "12",
    Montana: "30",
    Utah: "49",
    Vermont: "50",
    Washington: "53",
    "West Virginia": "54",
    Wyoming: "56",
    "Puerto Rico": "72"
};
