import { html } from "lit-html";
import { toggle } from "../components/Toggle";

import Layer, { addBelowLabels } from "../map/Layer";
import { stateNameToFips, COUNTIES_TILESET } from "../utils";

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
            ${toggle(`Show ${state.place.id === "louisiana" ? "Parish" : "County"} Boundaries`, false, checked =>
                counties.setOpacity(
                    checked ? COUNTIES_LAYER.paint["fill-opacity"] : 0
                ),
                "countyVisible"
            )}
        `
    );
}
