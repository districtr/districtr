import mapbox from "mapbox-gl";

mapbox.accessToken =
    "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";

export function initializeMap(mapContainer) {
    const map = new mapbox.Map({
        container: mapContainer,
        style: "mapbox://styles/mapbox/streets-v10",
        center: [-71.32, 42.64],
        zoom: 12
    });
    map.on("load", () => addPlaceholderLayers(map));
}

function addPlaceholderLayers(map) {
    const placeholderLayerSource = {
        type: "vector",
        url: "mapbox://districtr.5rvygwsf"
    };

    map.addSource("units", placeholderLayerSource);

    const placeholderLayers = [
        {
            id: "units",
            source: "units",
            "source-layer": "data-cktc5t",
            type: "fill",
            paint: {
                "fill-color": "#0099cd",
                "fill-opacity": 0.3
            }
        },
        {
            id: "units-borders",
            type: "line",
            source: "units",
            "source-layer": "data-cktc5t",
            paint: {
                "line-color": "#010101",
                "line-width": 1,
                "line-opacity": 0.3
            }
        }
    ];

    placeholderLayers.forEach(layer => {
        addBelowLabels(map, layer);
    });
}

function addBelowLabels(map, layer) {
    const layers = map.getStyle().layers;
    const firstSymbolId = getFirstSymbolID(layers);
    map.addLayer(layer, firstSymbolId);
}

function getFirstSymbolID(layers) {
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") {
            return layers[i].id;
        }
    }
}
