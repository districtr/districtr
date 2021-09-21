import mapboxgl from "mapbox-gl";
import { unitBordersPaintProperty, getUnitColorProperty } from "../colors";
import Layer from "./Layer";
import { stateNameToFips, COUNTIES_TILESET, spatial_abilities, numberWithCommas } from "../utils";
import { createMarginPerCapitaRule } from "../layers/color-rules";

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
        this.mapboxgl = mapboxgl;
    }
}

function addUnits(map, parts, tileset, layerAdder, coibg) {
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
            id: tileset.sourceLayer + "-borders",
            type: "line",
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            paint: unitBordersPaintProperty
        },
        layerAdder
    );

    let coiunits, coiunits2;
    if (coibg) {
        coiunits = new Layer(
            map,
            {
                id: "browse_" + coibg.sourceLayer.replace("precincts", "blockgroups").replace("counties", "blockgroups"),
                source: coibg.sourceLayer.replace("precincts", "blockgroups").replace("counties", "blockgroups"),
                "source-layer": coibg.sourceLayer.replace("precincts", "blockgroups").replace("counties", "blockgroups"),
                type: "fill",
                paint: { "fill-opacity": 1/2, "fill-pattern": "transparent" }
            },
            layerAdder
        );
    }

    return { units, unitsBorders, coiunits, coiunits2 };
}

function addPoints(map, tileset, layerAdder) {
    if (!tileset) {
        return null;
    }
    return new Layer(
        map,
        {
            id: tileset.sourceLayer + "-points",
            type: "circle",
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            paint: {
                "circle-opacity": 0
            }
        },
        layerAdder
    );
}

function addPrecincts(map, tileset, layerAdder, newest) {
    return new Layer(map, {
        id: "extra-precincts" + (newest ? "_new" : ""),
        type: "fill",
        source: tileset.sourceLayer,
        "source-layer": tileset.sourceLayer,
        paint: {
            "fill-opacity": 0
        }
    });
}

function addTracts(map, tileset, layerAdder) {
    return new Layer(map, {
        id: "extra-tracts",
        type: "fill",
        source: tileset.sourceLayer,
        "source-layer": tileset.sourceLayer,
        paint: {
            "fill-opacity": 0
        }
    });
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
            String(stateNameToFips[placeID.toLowerCase().replace("2020", "").replace("_bg", "").replace("wisco2019acs", "wisconsin").replace("mnacs", "minnesota")])
        ]
    },
    layerAdder);
}

function addBGs(map, tileset, layerAdder) {
    return new Layer(map, {
        id: "extra-bgs",
        type: "fill",
        source: tileset.sourceLayer,
        "source-layer": tileset.sourceLayer,
        background: true,
        paint: {
            "fill-opacity": 0
        }
    });
}

function addCOISources(map, tilesets, border) {
    // First, we need to verify that:
    //      1. we are actually performing a redistricting,
    //      2. that the proper `load_coi` flag is set for the jurisdiction we're
    //         redistricting,
    //      3. and that the number of tilesets we've loaded is 2 (we don't want
    //         to load any more than we can afford).
    let flagged = spatial_abilities(border).load_coi,
        numLoaded = tilesets.length === 2,
        baseUnits = tilesets.find(t => t.type === "fill"),
        blockGroups = false,
        bgName, bgURL;
    
    if (border && flagged && numLoaded && blockGroups) {
        // Now, we've identified our filled tileset -- that is, the set of units
        // we're using to redistrict. Next, we want to load the tileset we'll be
        // using to display our COIs; this is typically the same tileset, but
        // since we need to modify 
        bgName = baseUnits.sourceLayer
            .replace("precincts", "blockgroups")
            .replace("counties", "blockgroups");
        bgURL = baseUnits.source.url
            .replace("precincts", "blockgroups")
            .replace("counties", "blockgroups");

        // Now, if the URL exists -- that is, if we want to display the block
        // group layer on top of our base units -- we add the block groups
        // as a source.
        if (baseUnits) map.addSource(bgName, { type: "vector", url: bgURL });
    } else if (border && flagged && numLoaded) {
        // Otherwise, if we want to just use the existing tileset, we may have
        // to add another. Not sure yet.
    }

    return baseUnits;
}

function cities(map, border) {
    // If the border flag for cities doesn't exist, then return immediately.
    if (!spatial_abilities(border).border) return

    // Otherwise, retrieve city border data from /assets and plot the borders
    // as a Layer on the Map.
    fetch(`/assets/city_border/${border}.geojson?v=2`)
        .then(res => res.json())
        .then(geojson => {
            // Add a Map source for the border itself. TODO: this is a bit messy,
            // and should be cleaned up later.
            map.addSource("city_border", {
                type: "FeatureCollection",
                features: geojson.features.map(
                    f => f.geometry.type === "Polygon"
                    ? { type: "Feature", geometry: { "type": "LineString", coordinates: f.geometry.coordinates[0] } }
                    : f
                )
            });

            // Add a map source for the border polygons.
            map.addSource("city_border_poly", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: geojson.features.filter(
                        f => String(f.geometry.type).includes("Polygon")
                    )
                }
            });

            // Now, add layers for each.
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

/**
 * @description Adds the desired layers -- each of the tilesets in `tilesets` and
 * the extras we add for COIs if the module is flagged that way -- to mapbox.
 * @param {mapboxgl.Map} map Map rendered to the view.
 * @param {mapboxgl.Map|null} swipemap Typically null.
 * @param {Object[]} parts Objects for each district in the plan.
 * @param {mapboxgl.tileset[]} tilesets Tilesets loaded by default.
 * @param {Function} adder Inserts new Layers. 
 * @param {string} border Name of the jurisdiction we're in.
 */
export function addLayers(map, swipemap, parts, tilesets, adder, border) {
    // For each of the default tilesets -- base units and points -- add them as
    // sources for the Map.
    for (let tileset of tilesets) map.addSource(tileset.sourceLayer, tileset.source);

    // Now, we add block group sources to the Map, and get back the base unit
    // tileset. Since we've separated these out, we want to add the base unit
    // tileset to the map.
    let baseUnits = addCOISources(map, tilesets, border),
        { units, unitsBorders, coiunits, coiUnits2 } = addUnits(
            map, parts, baseUnits, adder, baseUnits
        ),
        points = addPoints(
            map,
            tilesets.find(t => t.type === "circle"),
            adder
        ),
        counties = addCounties(map, COUNTIES_TILESET, adder, border),
        bg_areas = null,
        precincts, new_precincts, tracts;

    // Cities in Communities of Interest will have thicker borders.
    cities(map, border);
    
    return {
        units, unitsBorders, coiunits, coiUnits2, points, counties, bg_areas,
        precincts, new_precincts, tracts
    }
}
