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
        center: [-73.2, 40.76],
        zoom: 11
    }
};

export function initializeMap(mapContainer, layerInfo) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v9",
        ...layerInfo.mapOptions
    });
    return map;
}
