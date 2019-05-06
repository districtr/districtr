import mapbox from "mapbox-gl";
import { unitBordersPaintProperty, getUnitColorProperty } from "../colors";
import Layer from "../Layers/Layer";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export function initializeMap(
    mapContainer,
    options,
    mapStyle = "mapbox://styles/mapbox/light-v10"
) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: mapStyle,
        attributionControl: false,
        center: [-86.0, 37.83],
        zoom: 3,
        pitchWithRotate: false,
        // dragRotate: false,
        dragPan: true,
        touchZoomRotate: true,
        ...options
    });
    const nav = new mapbox.NavigationControl();
    map.addControl(nav, "top-left");
    return map;
}

function addUnits(map, parts, tileset, layerAdder) {
    const units = new Layer(
        map,
        {
            id: tileset.sourceLayer,
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            type: "fill",
            paint: {
                "fill-color": getUnitColorProperty(parts),
                "fill-opacity": 0.8
            }
        },
        layerAdder
    );
    const unitsBorders = new Layer(
        map,
        {
            id: "units-borders",
            type: "line",
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            paint: unitBordersPaintProperty
        },
        layerAdder
    );

    return { units, unitsBorders };
}

function addPoints(map, tileset) {
    return new Layer(map, {
        id: "units-points",
        type: "circle",
        source: tileset.sourceLayer,
        "source-layer": tileset.sourceLayer,
        paint: {
            "circle-opacity": 0
        }
    });
}

export function addLayers(map, parts, tilesets, layerAdder) {
    for (let tileset of tilesets) {
        map.addSource(tileset.sourceLayer, tileset.source);
    }

    const { units, unitsBorders } = addUnits(
        map,
        parts,
        tilesets.find(tileset => tileset.type === "fill"),
        layerAdder
    );
    const points = addPoints(
        map,
        tilesets.find(tileset => tileset.type === "circle"),
        layerAdder
    );

    return { units, unitsBorders, points };
}
