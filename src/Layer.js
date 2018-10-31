export function addBelowLabels(map, layer) {
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

export default class Layer {
    constructor(map, layer, adder) {
        this.map = map;
        this.id = layer.id;
        this.sourceID = layer.source;
        this.sourceLayer = layer["source-layer"];

        this.defaultPaint = layer.paint;

        if (adder) {
            adder(map, layer);
        } else {
            map.addLayer(layer);
        }
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
    setPaintProperty(name, value) {
        this.map.setPaintProperty(this.id, name, value);
    }
    resetPaintProperty(name) {
        this.map.setPaintProperty(this.id, name, this.defaultPaint[name]);
    }
    getFeatureState(featureID) {
        return this.map.getFeatureState({
            source: this.sourceID,
            sourceLayer: this.sourceLayer,
            id: featureID
        });
    }
    on(type, ...args) {
        this.map.on(type, this.id, ...args);
    }
    off(type, ...args) {
        this.map.off(type, this.id, ...args);
    }
}
