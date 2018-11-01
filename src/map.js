import mapbox from "mapbox-gl";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export const lowell = {
    source: {
        type: "vector",
        url: "mapbox://districtr.5hsufp8g"
    },
    sourceLayer: "Lowell_blocks-aosczb",
    mapOptions: {
        center: [-71.32, 42.64],
        zoom: 12
    }
};

export const islip = {
    source: {
        type: "vector",
        url: "mapbox://districtr.44esa6ch"
    },
    sourceLayer: "blocks-cczvxy",
    populationAttribute: "tot_pop",
    mapOptions: {
        center: [-73.17, 40.76],
        zoom: 11
    }
};

export const MA_sec_state_vtds = {
    source: {
        type: "vector",
        url: "mapbox://districtr.d1ci1avi"
    },
    sourceLayer: "MA_FINAL_VTD2010_LEDRC-71bhd3",
    populationAttribute: "Population",
    mapOptions: {
        center: [(-73.5 + -69.9) / 2, (41.2 + 42.9) / 2],
        zoom: 7
    },
    aggregated: {
        population: 6.54782e6
    },
    numberOfDistricts: 9
};

export const MA_towns = {
    source: {
        type: "vector",
        url: "mapbox://districtr.20p0zp1z"
    },
    sourceLayer: "FinalMass-ahm0xy",
    populationAttribute: "POP2010",
    mapOptions: {
        center: [(-73.5 + -69.9) / 2, (41.2 + 42.9) / 2],
        zoom: 7
    },
    aggregated: {
        population: 6547629
    },
    numberOfDistricts: 9,
    elections: [
        {
            id: "2004",
            partiesToColumns: {
                Democratic: "Pres04D",
                Republican: "Pres04R"
            }
        }
    ]
};

// TODO: Just use map.fitBounds() on the bounding box of the tileset,
// instead of computing the center and guessing the zoom.

export function initializeMap(mapContainer, layerInfo) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v9",
        attributionControl: false,
        ...layerInfo.mapOptions
    });
    const nav = new mapbox.NavigationControl();
    map.addControl(nav, "top-left");
    return map;
}
