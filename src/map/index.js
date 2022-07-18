import mapboxgl from "mapbox-gl";
import { unitBordersPaintProperty, getUnitColorProperty } from "../colors";
import Layer from "./Layer";
import {
    stateNameToFips,
    COUNTIES_TILESET,
    spatial_abilities
} from "../utils";

mapboxgl.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export class MapState {
    /**
     * @constructor
     * @description Instantiates MapState, which holds the state for the current map.
     * @param {String} mapContainer Container element for the map.
     * @param {Object} options Map options.
     * @param {String} mapStyle Map style.
     */
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

/**
 * @dsecription Adds base units to the map.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {Array} parts Array of Parts to be added to the map.
 * @param {Object} tileset MapboxGL tileset specification.
 * @param {Function} layerAdder How we add layers to the map.
 * @returns {Object} Deconstructible object containing base units and borders.
 */
function addBaseUnits(map, parts, tileset, layerAdder) {
    const units = new Layer(map, {
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

    const unitsBorders = new Layer(map, {
            id: tileset.sourceLayer + "-borders",
            type: "line",
            source: tileset.sourceLayer,
            "source-layer": tileset.sourceLayer,
            paint: unitBordersPaintProperty
        },
        layerAdder
    );

    return { units, unitsBorders };
}

/**
 * @description Adds a Points layer to the map.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {Object} tileset districtr-interpretable tileset specification.
 * @param {Function} layerAdder How do we add stuff?
 * @returns {Layer} districtr Layer object.
 */
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

/**
 * @description Adds precinct layers to the map.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {Object[]} tilesets districtr-interpretable tileset specifications.
 * @param {String} stateName How do we add stuff?
 * @returns {[Object, Object]} Pair of Layer objects corresponding to precincts.
 */
function addPrecincts(map, tilesets, stateName) {
    let stateHasCOI2 = spatial_abilities(stateName).coi2,
        tilesetHasCOI2 = tilesets[0].coi2,
        oldTileset, newTileset, oldPrecincts, newPrecincts;

    // TODO: figure out a better way to handle these exceptions.
    if (stateHasCOI2 && tilesetHasCOI2) {
        oldTileset = tilesets.find((t) => t.source.url.includes("nc_precincts"));
        newTileset = tilesets.find((t) => t.source.url.includes("norcar2_precincts"));

        oldPrecincts = new Layer(map, {
            id: "extra-precincts",
            type: "fill",
            source: oldTileset.sourceLayer,
            "source-layer": oldTileset.sourceLayer,
            paint: {
                "fill-opacity": 0
            }
        });

        newPrecincts = new Layer(map, {
            id: "extra-precincts_new",
            type: "fill",
            source: newTileset.sourceLayer,
            "source-layer": newTileset.sourceLayer,
            paint: {
                "fill-opacity": 0
            }
        });
    }

    return { oldPrecincts, newPrecincts };
}

/**
 * @description Adds Census tracts (or block groups, or precincts) as a background layer.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {Object[]} tilesets Array of MapboxGL tileset specifications.
 * @param {String} stateName Name of the state we're redistricting in.
 * @returns {Layer|null} Null if the exception isn't included, or a Layer instance.
 */
function addTracts(map, tilesets, stateName) {
    // Create a list of exceptions which require the loading of block group tilesets
    // rather than precinct or tract tilesets.
    let exceptions = [
            "sacramento", "ca_sonoma", "ca_pasadena", "ca_santabarbara", "ca_goleta",
            "ca_marin", "ca_kings", "ca_merced", "ca_fresno", "ca_nevada", "ca_marina",
            "ca_arroyo", "ca_sm_county", "ca_sanbenito", "ca_cvista", "ca_bellflower",
            "ca_camarillo", "ca_fresno_ci", "ca_campbell", "ca_chino", "ca_fremont",
            "lake_el", "ca_vallejo", "ca_buellton", "ca_oceano", "ca_grover", "buenapark",
            "ca_stockton", "halfmoon", "ca_carlsbad", "ca_richmond", "elcajon", "laverne",
            "encinitas", "lodi", "pomona", "sunnyvale", "glendaleaz", "yuma", "yuma_awc",
            "ca_glendora", "san_dimas", "ca_santabarbara", "ca_marin", "ca_kings",
            "ca_merced", "ca_fresno", "ca_sm_county", "ca_sanbenito", "laverne",
            "ca_glendora", "san_dimas", "anaheim", "arcadia", "la_mirada", "placentia",
            "lakewood", "san_bruno", "ca_santabarbara", "ca_marin", "ca_kings",
            "ca_merced", "ca_fresno", "ca_sm_county", "ca_sanbenito", "laverne",
            "ca_poway", "ca_torrance", "29palms", "navajoco", "yuba_city", "buena_park"
        ],
        isException = exceptions.includes(stateName),
        hasCountyFilter = spatial_abilities(stateName).county_filter,
        tileType,
        tileset;

    // If this state isn't one of the exceptions or doesn't have a county filter,
    // return null immediately.
    if (!(isException || hasCountyFilter)) return null;

    // Otherwise, create a new Layer.
    tileType = isException ? "blockgroups" : "precincts";
    tileset = tilesets.find((t) => t.source.url.includes(tileType));

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

/**
 * @description Adds a county layer to the map.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {Object[]} tileset Array of MapboxGL tileset specifications.
 * @param {Function} layerAdder How we add layers to the map.
 * @param {String} placeID Identifier for the given place.
 * @returns {Layer} A districtr Layer instance.
 */
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

/**
 * @description Adds block groups units to areas which require them.
 * @param {mapboxgl.Map} map MapboxGL map object.
 * @param {Object} tileset MapboxGL tileset specification.
 * @param {Function} layerAdder How to aadd layers to the map.
 */
function addBGs(map, tileset, layerAdder, borderID) {
    // Manage exceptions.
    let exceptions = ["yuma", "nwaz", "seaz", "maricopa", "phoenix", "nyc_popdemo"];
    if (!exceptions.includes(borderID)) return null;

    // Otherwise, create a block groups layer.
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

/**
 * @description Adds COI units to the map.
 * @param {mapboxgl.Map} map MapboxGL Map object.
 * @param {String} stateName Name of the state we're redistricting in.
 * @returns {Object} A deconstructible pair of cluster units and COI units.
 */
function addCOIUnits(map, stateName) {
    // For this new standard, we're defining the COI units in `utils.js` rather
    // than handling them here.
    let coi = spatial_abilities(stateName).coi;

    // If we don't load COIs, do nothing; otherwise, load the units.
    if (!coi) {
        return {
            clusterUnits: null,
            clusterUnitsLines: null,
            coiUnits: null,
            coiUNitsLines: null
        };
    }

    // Add COI units.
    let tilesets = coi.tilesets,
        clusterTileset = tilesets.find((t) => t.clusterLayer),
        coiTileset = tilesets.find((t) => !t.clusterLayer && t.type == "fill"),
        existingSources = Object.keys(map.getStyle().sources),
        clusterLayerAlreadyExists = clusterTileset ? existingSources.includes(clusterTileset.sourceLayer) : true,
        coiLayerAlreadyExists = coiTileset ? existingSources.includes(coiTileset.sourceLayer) : true,
        clusterUnits, coiUnits, clusterUnitsLines, coiUnitsLines;

    // Add tileset sources.
    for (let tileset of tilesets) map.addSource(tileset.sourceLayer, tileset.source);

    // Create a new Layer for the cluster units, if the cluster unit tileset is
    // specified (per utils.js); also add the lines for this layer.
    if (!clusterLayerAlreadyExists && clusterTileset) {
        clusterUnits = new Layer(map, {
            id: clusterTileset.sourceLayer,
            type: clusterTileset.type,
            source: clusterTileset.sourceLayer,
            "source-layer": clusterTileset.sourceLayer,
            paint: {
                "fill-opacity": 0,
                "fill-color": "transparent"
            }
        });

        clusterUnitsLines = new Layer(map, {
            id: clusterTileset.sourceLayer + "-lines",
            type: "line",
            source: clusterTileset.sourceLayer,
            "source-layer": clusterTileset.sourceLayer,
            paint: {
                "line-width": 0,
                "line-color": "transparent"
            }
        });
    }

    // Create a new Layer for the COI units, if the COI unit tileset is
    // specified; also add the lines for this layer.
    if (!coiLayerAlreadyExists && coiTileset) {
        coiUnits = new Layer(map, {
            id: coiTileset.sourceLayer,
            type: coiTileset.type,
            source: coiTileset.sourceLayer,
            "source-layer": coiTileset.sourceLayer,
            paint: {
                "fill-opacity": 0,
                "fill-color": "transparent"
            }
        });

        coiUnitsLines = new Layer(map, {
            id: coiTileset.sourceLayer,
            type: "line",
            source: coiTileset.sourceLayer,
            "source-layer": coiTileset.sourceLayer,
            paint: {
                "line-width": 0,
                "line-color": "transparent"
            }
        });
    }

    return { clusterUnits, clusterUnitsLines, coiUnits, coiUnitsLines };
}

/**
 * @description Adds city borders to certain modules.
 * @param {mapboxgl.Map} map MapboxGL Map instance.
 * @param {String} cityID Module identifier.
 * @returns {undefined}
 */
function cities(map, cityID) {
    // If the border flag for cities doesn't exist, then return immediately.
    if (!spatial_abilities(cityID).border) return null;

    // Otherwise, retrieve city border data from /assets and plot the borders
    // as a Layer on the Map.
    fetch(`/assets/city_border/${cityID}.geojson?v=2`)
        .then(res => res.json())
        .then(geojson => {
            // Add a Map source for the border itself. TODO: this is a bit messy,
            // and should be cleaned up later.
            map.addSource("city_border", {
                type: "geojson",
                data: {
                  type: "FeatureCollection",
                  features: geojson.features.map(
                      f => f.geometry.type === "Polygon"
                      ? { type: "Feature", geometry: { "type": "LineString", coordinates: f.geometry.coordinates[0] } }
                      : f
                  )
                }
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
            let _ = new Layer(
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

            /*
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
            */
        });
}

/**
 * @description Adds the desired layers -- each of the tilesets in `tilesets` and
 * the extras we add for COIs if the module is flagged that way -- to mapbox.
 * @param {mapboxgl.Map} map Map rendered to the view.
 * @param {mapboxgl.Map|null} swipemap Typically null.
 * @param {Object[]} parts Objects for each district in the plan.
 * @param {Object[]} tilesets MapboxGL tileset specifications loaded by default.
 * @param {Function} layerAdder Inserts new Layers.
 * @param {String} borderID Name of the map module
 * @param {string} stateName Name of the state
 */
export function addLayers(map, swipemap, parts, tilesets, layerAdder, borderID, stateName) {
    // For each of the default tilesets -- base units and points -- add them as
    // sources for the Map.
    for (let tileset of tilesets) map.addSource(tileset.sourceLayer, tileset.source);

        // Add base units to the map.
    let clusterTileset = tilesets.find((t) => t.type === "fill"),
        { units, unitsBorders } = addBaseUnits(map, parts, clusterTileset, layerAdder),

        // Add point units to the map.
        pointTileset = tilesets.find((t) => t.type === "circle"),
        points = addPoints(map, pointTileset, layerAdder),

        // Add county units to the map.
        counties = addCounties(map, COUNTIES_TILESET, layerAdder, stateName),

        // Add block group units to the map.
        bgTileset = tilesets.find((t) => t.source.url.includes("blockgroups") && !t.source.url.includes("points")),
        bgAreas = addBGs(map, bgTileset, layerAdder, borderID),
        bg_areas = bgAreas,

        // Add COI units to the map.
        {
            clusterUnits, clusterUnitsLines, coiUnits, coiUnitsLines
        } = addCOIUnits(map, stateName.toLowerCase()),
        coiunits = coiUnits,
        coiUnits2 = null,

        // Add *specifically handled* precinct units to the map.
        { oldPrecincts, newPrecincts } = addPrecincts(map, tilesets, stateName),
        precincts = oldPrecincts,
        new_precincts = newPrecincts,

        // Add *specifically handled* tract units to the map.
        tracts = addTracts(map, tilesets, borderID);

    // Cities in Communities of Interest will have thicker borders.
    cities(map, borderID);

    return {
        units, unitsBorders, coiunits, coiUnits2, points, counties, bg_areas,
        precincts, new_precincts, tracts, clusterUnits, clusterUnitsLines
    };
}
