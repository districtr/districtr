import mapboxgl from "mapbox-gl";
import { unitBordersPaintProperty, getUnitColorProperty } from "../colors";
import Layer from "./Layer";

mapboxgl.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export class MapState {
    constructor(mapContainer, options, mapStyle) {
        this.map = new mapboxgl.Map({
            container: mapContainer,
            style: mapStyle,
            attributionControl: false,
            center: [-86.0, 37.83],
            zoom: 3,
            pitchWithRotate: false,
            // dragRotate: false,
            preserveDrawingBuffer: true,
            dragPan: true,
            touchZoomRotate: true,
            ...options
        });
        this.nav = new mapboxgl.NavigationControl();
        this.map.addControl(this.nav, "top-left");
        this.mapboxgl = mapboxgl;

        this.map.on("load", () => {
            this.map.setLayoutProperty('country-label', 'text-field', ['get', 'name_es']);
            this.map.setLayoutProperty('state-label', 'text-field', ['get', 'name_es']);
            // this.map.setLayoutProperty('place-label', 'text-field', ['get', 'name_es']);
        });
    }
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

export function addLayers(map, parts, tilesets, layerAdder, borderId) {
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

    // cities in Communities of Interest will have a thick border
    if (borderId) {
        fetch(`/assets/city_border/${borderId}.geojson`).then(res => res.json())
            .catch(err => {})
            .then((geojson) => {

            map.addSource('city_border', {
                type: 'geojson',
                data: geojson
            });

            new Layer(
                map,
                {
                    id: "city_border",
                    source: "city_border",
                    type: "line",
                    paint: {
                        "line-color": "#000",
                        "line-opacity": 0.7,
                        "line-width": 3
                    }
                }
            );
        });
    }

    return { units, unitsBorders, points };
}
