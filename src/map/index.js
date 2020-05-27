import mapboxgl from "mapbox-gl";
import MapboxCompare from 'mapbox-gl-compare';
import { unitBordersPaintProperty, getUnitColorProperty } from "../colors";
import Layer from "./Layer";
import { stateNameToFips, COUNTIES_TILESET } from "../utils";

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
            dragRotate: false,
            preserveDrawingBuffer: true,
            dragPan: true,
            touchZoomRotate: true,
            ...options
        });
        this.nav = new mapboxgl.NavigationControl();
        this.map.addControl(this.nav, "top-left");

        this.swipemap = new mapboxgl.Map({
            container: "swipemap",
            style: mapStyle,
            attributionControl: false,
            center: [-86.0, 37.83],
            zoom: 3,
            pitchWithRotate: false,
            dragRotate: false,
            preserveDrawingBuffer: true,
            dragPan: true,
            touchZoomRotate: true,
            ...options
        });

        this.comparer = new MapboxCompare(this.map, this.swipemap, "#comparison-container", {});
        this.comparer.setSlider(10000);

        this.mapboxgl = mapboxgl;
    }
}

function addUnits(map, comparer, parts, tileset, layerAdder) {
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
        layerAdder,
        comparer
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

function addPoints(map, comparer, tileset, layerAdder) {
    return new Layer(
        map,
        {
            id: "units-points",
            type: "circle",
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            paint: {
                "circle-opacity": 0
            }
        },
        layerAdder,
        comparer
    );
}

function addCounties(map, tileset, layerAdder, placeID) {
    map.addSource(tileset.sourceLayer, tileset.source);
    return new Layer(map, {
        id: "county-hover",
        type: "fill",
        source: tileset.sourceLayer,
        "source-layer": tileset.sourceLayer,
        paint: {
            "fill-opacity": [
                "case",
                ["boolean", ["feature-state", "hover"], false],
                0.6,
                0
            ],
            "fill-color": "#aaa"
        },
        filter: [
            "==",
            ["get", "STATEFP"],
            String(stateNameToFips[placeID.toLowerCase()])
        ]
    },
    layerAdder);
}

export function addLayers(map, swipemap, comparer, parts, tilesets, layerAdder, borderId) {
    for (let tileset of tilesets) {
        map.addSource(tileset.sourceLayer, tileset.source);
        swipemap.addSource(tileset.sourceLayer, tileset.source);
    }
    const { units, unitsBorders } = addUnits(
        map,
        comparer,
        parts,
        tilesets.find(tileset => tileset.type === "fill"),
        layerAdder
    );
    let swipe_details = addUnits(
        swipemap,
        comparer,
        parts,
        tilesets.find(tileset => tileset.type === "fill"),
        layerAdder
    );
    const swipeUnits = swipe_details.units;
    const swipeUnitsBorders = swipe_details.unitsBorders;
    const points = addPoints(
        swipemap,
        comparer,
        tilesets.find(tileset => tileset.type === "circle"),
        layerAdder
    );
    const counties = addCounties(
        map,
        COUNTIES_TILESET,
        layerAdder,
        borderId
    );

    // cities in Communities of Interest will have a thick border
    if (["austin", "chicago", "lowell", "ontarioca", "philadelphia", "providence_ri", "santa_clara", "napa", "napaschools", "portlandor", "kingcountywa"].includes(borderId)) {
        fetch(`/assets/city_border/${borderId}.geojson`)
            .then(res => res.json())
            .then((geojson) => {

            map.addSource('city_border', {
                type: 'geojson',
                data: {
                  type: "FeatureCollection",
                  features: geojson.features.map(f => f.geometry.type === "Polygon"
                      ? { type: "Feature", geometry: { type: "LineString", coordinates: f.geometry.coordinates[0] } }
                      : f)
                }
            });
            map.addSource('city_border_poly', {
                type: 'geojson',
                data: {
                  type: "FeatureCollection",
                  features: geojson.features.filter(f => f.geometry.type === "Polygon")
                }
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
                        "line-width": 1.5
                    }
                }
            );
            new Layer(
                map,
                {
                    id: "city_border_poly",
                    source: "city_border_poly",
                    type: "fill",
                    paint: {
                        "fill-color": "#444",
                        "fill-opacity": 0.3
                    }
                }
            );
        });
    }

    return { units, unitsBorders, swipeUnits, swipeUnitsBorders, points, counties };
}
