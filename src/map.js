import mapbox from "mapbox-gl";
import { blockColorProperty } from "./colors";
import Layer, { addBelowLabels } from "./Layers/Layer";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

// TODO: Just use map.fitBounds() on the bounding box of the tileset,
// instead of computing the center and guessing the zoom.

export function initializeMap(mapContainer) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v9",
        attributionControl: false,
        center: [-86.0, 37.83],
        zoom: 3
    });
    const nav = new mapbox.NavigationControl();
    map.addControl(nav, "top-left");
    return map;
}

export function addLayers(map, layerInfo) {
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
                "line-color": "#777777",
                "line-width": 1,
                "line-opacity": 0.3
            }
        },
        addBelowLabels
    );

    map.fitBounds(layerInfo.bounds);

    return { units, unitsBorders };
}
