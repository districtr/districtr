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
        this.sourceId = layer.source;
        this.sourceLayer = layer["source-layer"];

        this.defaultPaint = layer.paint;

        if (adder) {
            adder(map, layer);
        } else {
            map.addLayer(layer);
        }

        this.whenLoaded = this.whenLoaded.bind(this);
        this.getFeature = this.getFeature.bind(this);
    }
    setFeatureState(featureID, state) {
        this.map.setFeatureState(
            {
                source: this.sourceId,
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
    getPaintProperty(name) {
        return this.map.getPaintProperty(this.id, name);
    }
    getFeatureState(featureID) {
        return this.map.getFeatureState({
            source: this.sourceId,
            sourceLayer: this.sourceLayer,
            id: featureID
        });
    }
    getFeature(featureID) {
        const features = this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer,
            filter: ["==", ["id"], featureID]
        });
        return features[0];
    }
    getAssignment(featureID) {
        return this.getFeatureState(featureID).color;
    }
    setAssignment(featureId, part) {
        this.setFeatureState(featureId, { color: part });
    }
    on(type, ...args) {
        this.map.on(type, this.id, ...args);
    }
    off(type, ...args) {
        this.map.off(type, this.id, ...args);
    }
    /**
     * Query the properties of the features of the source layer
     * @param {string or function} getter
     */
    query(getter) {
        const queryFunction = getQueryFunction(getter);
        const features = this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer
        });
        let seenIds = new Set();
        let data = [];

        for (let i = 0; i < features.length; i++) {
            if (!seenIds.has(features[i].id)) {
                seenIds.add(features[i].id);
                data.push(queryFunction(features[i]));
            }
        }
        return data;
    }
    whenLoaded(f) {
        this.map.once("data", () => {
            if (
                this.map.isSourceLoaded(this.sourceId) &&
                this.query().length > 0
            ) {
                f();
            } else {
                this.whenLoaded(f);
            }
        });
    }
}

function isString(x) {
    return typeof x === "string" || x instanceof String;
}

function getQueryFunction(getter) {
    // If it's a string key, get that property for each feature
    let queryFunction = f => f;
    if (getter !== undefined) {
        queryFunction = isString(getter)
            ? feature => feature.properties[getter]
            : getter;
    }
    return queryFunction;
}
