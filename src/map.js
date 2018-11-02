import mapbox from "mapbox-gl";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

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
