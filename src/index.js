import { HoverWithRadius } from "./Hover";
import Layer, { addBelowLabels } from "./Layer";
import { initializeMap } from "./map";

const map = initializeMap("map");

map.on("load", () => addPlaceholderLayers(map));

function addPlaceholderLayers(map) {
    const placeholderLayerSource = {
        type: "vector",
        url: "mapbox://districtr.5rvygwsf"
    };

    map.addSource("units", placeholderLayerSource);

    const units = new Layer(
        map,
        {
            id: "units",
            source: "units",
            "source-layer": "data-cktc5t",
            type: "fill",
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#aaaaaa",
                    "#f9f9f9"
                ],
                "fill-opacity": 0.8
            }
        },
        addBelowLabels
    );
    const unitsBorders = new Layer(
        map,
        {
            id: "units-borders",
            type: "line",
            source: "units",
            "source-layer": "data-cktc5t",
            paint: {
                "line-color": "#010101",
                "line-width": 1,
                "line-opacity": 0.3
            }
        },
        addBelowLabels
    );

    const hover = new HoverWithRadius(units, 10);
}
