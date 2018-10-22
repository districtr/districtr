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
    return map;
}

function addPlaceholderLayers(map) {
    const placeholderLayerSource = {
        type: "vector",
        url: "mapbox://districtr.5rvygwsf"
    };

    map.addSource("units", placeholderLayerSource);

    const units = new Layer(
        map,
        {
            id: "units",
            source: "units",
            "source-layer": "data-cktc5t",
            type: "fill",
            paint: {
                "fill-color": [
                    "case",
                    ["boolean", ["feature-state", "hover"], false],
                    "#aaaaaa",
                    "#f9f9f9"
                ],
                "fill-opacity": 0.8
            }
        },
        addBelowLabels
    );
    const unitsBorders = new Layer(
        map,
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
        },
        addBelowLabels
    );

    const hover = new HoverWithRadius(units, 50);
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

class Layer {
    constructor(map, layer, adder) {
        this.map = map;
        this.id = layer.id;
        this.sourceID = layer.source;
        this.sourceLayer = layer["source-layer"];

        adder(map, layer);
    }
    setFeatureState(featureID, state) {
        this.map.setFeatureState(
            {
                source: this.sourceID,
                sourceLayer: this.sourceLayer,
                id: featureID
            },
            state
        );
    }
}

class Hover {
    constructor(layer) {
        this.layer = layer;

        this.hoveredStateId = null;

        layer.map.on("mousemove", this.layer.id, this.onMouseMove.bind(this));
        layer.map.on("mouseleave", this.layer.id, this.onMouseLeave.bind(this));
    }
    hoverOff() {
        this.layer.setFeatureState(this.hoveredStateId, { hover: false });
    }
    hoverOn() {
        this.layer.setFeatureState(this.hoveredStateId, { hover: true });
    }
    onMouseMove(e) {
        if (e.features.length > 0) {
            if (this.hoveredStateId) {
                this.hoverOff();
            }
            this.hoveredStateId = e.features[0].id;
            this.hoverOn();
        }
    }
    onMouseLeave() {
        if (this.hoveredStateId) {
            this.hoverOff();
        }
        this.hoveredStateId = null;
    }
}

class HoverWithRadius {
    constructor(layer, radius) {
        this.layer = layer;
        this.radius = radius;

        this.hoveredFeatures = [];

        layer.map.on("mousemove", this.layer.id, this.onMouseMove.bind(this));
        layer.map.on("mouseleave", this.layer.id, this.hoverOff.bind(this));
    }
    hoverOff() {
        while (this.hoveredFeatures.length > 0) {
            let feature = this.hoveredFeatures.pop();
            this.layer.setFeatureState(feature.id, { hover: false });
        }
    }
    hoverOn(features) {
        this.hoveredFeatures = features;
        this.hoveredFeatures.forEach(feature => {
            this.layer.setFeatureState(feature.id, { hover: true });
        });
    }
    onMouseMove(e) {
        const box = boxAround(e.point, this.radius, this.layer.map);
        const features = this.layer.map.queryRenderedFeatures(box, {
            layers: [this.layer.id]
        });
        if (features.length > 0) {
            this.hoverOff();
            this.hoverOn(features);
        }
    }
}

function boxAround(point, radius, map) {
    const southwest = [point.x + radius, point.y + radius];
    const northeast = [point.x - radius, point.y - radius];
    return [northeast, southwest];
}
