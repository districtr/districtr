import mapbox from "mapbox-gl";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export function initializeMap(mapContainer) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/light-v9",
        center: [-71.32, 42.64],
        zoom: 12
    });
    return map;
}
