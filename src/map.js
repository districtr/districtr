import mapbox from "mapbox-gl";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export const MA_towns = {
    source: {
        type: "vector",
        url: "mapbox://districtr.20p0zp1z"
    },
    sourceLayer: "FinalMass-ahm0xy",
    properties: {
        population: "POP10"
    },
    mapOptions: {
        center: [(-73.5 + -69.9) / 2, (41.2 + 42.9) / 2],
        zoom: 7
    },
    numberOfParts: 9,
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

export const MA_precincts = {
    source: {
        type: "vector",
        url: "mapbox://districtr.btydwuhf"
    },
    sourceLayer: "MA_precincts_correct_types-8f0w6d",
    properties: {
        population: {
            key: "Population",
            total: 6.54782e6,
            min: 75,
            max: 10172
        }
    },
    mapOptions: {
        center: [(-73.5 + -69.9) / 2, (41.2 + 42.9) / 2],
        zoom: 7
    },
    numberOfParts: 9,
    elections: [
        {
            id: "SEN12",
            year: 2012,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN12D",
                Republican: "SEN12R"
            }
        },
        {
            id: "PRES12",
            year: 2012,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "PRES12D",
                Republican: "PRES12R"
            }
        },
        {
            id: "SEN13",
            year: 2013,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN13D",
                Republican: "SEN13R"
            }
        },
        {
            id: "SEN14",
            year: 2014,
            race: "Senate",
            partiesToColumns: {
                Democratic: "SEN14D",
                Republican: "SEN14R"
            }
        },
        {
            id: "PRES16",
            year: 2013,
            race: "Presidential",
            partiesToColumns: {
                Democratic: "PRES16D",
                Republican: "PRES16R"
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
