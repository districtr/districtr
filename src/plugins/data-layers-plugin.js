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
                String(stateNameToFips[(state.place.state || state.place.id).toLowerCase()])
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
                let opacity = checked ? 0.8 : 0;
                state.units.setOpacity(opacity);
            })}
            ${(state.plan.problem.type === "community"
                || ["santa_clara", "lowell", "little_rock", "austin", "islip"].includes(state.place.id)
                || ["chicago_community_areas"].includes(state.units.sourceId)) ? null
                : toggle("Show district numbers", false, checked => {
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

    // Right now we're doing all of these if statements,
    // but in the future we should just be able to register
    // layer types for different columnSet types and have
    // that determine what is rendered.

    const demographicsOverlay = new OverlayContainer(
        "demographics",
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

    if (state.elections.length > 0) {
        const partisanOverlays = new PartisanOverlayContainer(
            "partisan",
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
    alabama: "01",
    alaska: "02",
    arizona: "04",
    arkansas: "05",
    california: "06",
    colorado: "08",
    connecticut: "09",
    delaware: 10,
    "district of columbia": 11,
    district_of_columbia: 11,
    florida: 12,
    georgia: 13,
    hawaii: 15,
    idaho: 16,
    illinois: 17,
    indiana: 18,
    iowa: 19,
    kansas: 20,
    kentucky: 21,
    louisiana: 22,
    maine: 23,
    maryland: 24,
    massachusetts: 25,
    ma: 25,
    michigan: 26,
    minnesota: 27,
    mississippi: 28,
    missouri: 29,
    montana: 30,
    nebraska: 31,
    nevada: 32,
    "new hampshire": 33,
    new_hampshire: 33,
    "new jersey": 34,
    new_jersey: 34,
    "new mexico": 35,
    new_mexico: 35,
    "new york": 36,
    new_york: 36,
    "north carolina": 37,
    north_carolina: 37,
    nc: 37,
    "north dakota": 38,
    north_dakota: 38,
    ohio: 39,
    oklahoma: 40,
    oregon: 41,
    pennsylvania: 42,
    "rhode island": 44,
    rhode_island: 44,
    "south carolina": 45,
    south_carolina: 45,
    "south dakota": 46,
    south_dakota: 46,
    tennessee: 47,
    texas: 48,
    utah: 49,
    vermont: 50,
    virginia: 51,
    washington: 53,
    "west virginia": 54,
    west_virginia: 54,
    wisconsin: 55,
    wyoming: 56,
    "puerto rico": 72,
    puerto_rico: 72
};
