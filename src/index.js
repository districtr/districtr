import { blockColorProperty } from "./colors";
import Layer, { addBelowLabels } from "./Layer";
import { initializeMap, islip } from "./map";
import initializeTools from "./tools";

const map = initializeMap("map", islip);

map.on("load", () => addPlaceholderLayers(map, islip));

function addPlaceholderLayers(map, layerInfo) {
    map.addSource("units", layerInfo.source);

    const units = new Layer(
        map,
        {
            id: "units",
            source: "units",
            "source-layer": layerInfo.sourceLayer,
            type: "fill",
            paint: {
                "fill-color": blockColorProperty,
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
            "source-layer": layerInfo.sourceLayer,
            paint: {
                "line-color": "#010101",
                "line-width": 1,
                "line-opacity": 0.3
            }
        },
        addBelowLabels
    );

    // Tools
    initializeTools(units);
}
