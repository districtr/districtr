/**
 * Add the layer to the map below the first label layer (e.g. street names).
 * @param {mapboxgl.Map} map
 * @param {Layer} layer
 */
export function addBelowLabels(map, layer) {
    const layers = map.getStyle().layers;
    const firstSymbolId = getFirstSymbolId(layers);
    map.addLayer(layer, firstSymbolId);
}

/**
 * @param {Object[]} layers list of layers from the Mapbox map's style
 * @returns {string} id of the first id of type "symbol"
 */
function getFirstSymbolId(layers) {
    for (var i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol") {
            return layers[i].id;
        }
    }
}

/** A layer on a Mapbox map. */
export default class Layer {
    /**
     * @param {mapboxgl.Map} map to add the layer to
     * @param {Object} layer a Layer object obeying the Mapbox style specification
     * @param {function} [adder] a function (map, layer) -> void that adds the layer
     *  to the map.
     */
    constructor(map, layer, adder) {
        this.map = map;
        this.id = layer.id;
        this.sourceId = isString(layer.source) ? layer.source : layer.id;
        this.type = layer.type;
        this.sourceLayer = layer["source-layer"];

        if (adder) {
            adder(map, layer);
        } else {
            map.addLayer(layer);
        }

        this.onceLoaded = this.onceLoaded.bind(this);
        this.getFeature = this.getFeature.bind(this);
    }
    setOpacity(opacity) {
        this.setPaintProperty(`${this.type}-opacity`, opacity);
    }
    setColor(color) {
        this.setPaintProperty(`${this.type}-color`, color);
    }
    setPaintProperties(properties) {
        for (let name in properties) {
            this.setPaintProperty(name, properties[name]);
        }
    }
    setFeatureState(featureId, state) {
        this.map.setFeatureState(
            {
                source: this.sourceId,
                sourceLayer: this.sourceLayer,
                id: featureId
            },
            state
        );
    }
    setPaintProperty(name, value) {
        this.map.setPaintProperty(this.id, name, value);
    }
    getPaintProperty(name) {
        return this.map.getPaintProperty(this.id, name);
    }
    getFeatureState(featureId) {
        return this.map.getFeatureState({
            source: this.sourceId,
            sourceLayer: this.sourceLayer,
            id: featureId
        });
    }
    getFeature(featureId) {
        const features = this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer,
            filter: ["==", ["id"], featureId]
        });
        return features[0];
    }
    getAssignment(featureId) {
        return this.getFeatureState(featureId).color;
    }
    setAssignment(feature, part) {
        this.setFeatureState(feature.id, {
            ...feature.state,
            color: part
        });
    }
    on(type, ...args) {
        this.map.on(type, this.id, ...args);
    }
    off(type, ...args) {
        this.map.off(type, this.id, ...args);
    }
    /**
     * Query the properties of the features of the source layer
     * @param {string or function} getter feature property key or a function
     *  (feature) -> any that retrieves desired data from individual features
     * @returns {Array} the results of the query
     */
    query(getter) {
        const queryFunction = getQueryFunction(getter);
        const features = this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer
        });
        let seenIds = new Set();
        let data = [];

        const numberOfFeatures = features.length;
        for (let i = 0; i < numberOfFeatures; i++) {
            if (!seenIds.has(features[i].id)) {
                seenIds.add(features[i].id);
                data.push(queryFunction(features[i]));
            }
        }
        return data;
    }
    queryRenderedFeatures() {
        return this.map.queryRenderedFeatures(null, { layers: [this.id] });
    }
    /**
     * Executes the given function once the layer's source is loaded.
     * @param {function} f - The function to execute when the Layer is loaded.
     */
    onceLoaded(f) {
        this.map.once("data", () => {
            if (
                this.map.getSource(this.sourceId) &&
                this.map.isSourceLoaded(this.sourceId) &&
                this.query().length > 0
            ) {
                const features = this.query();
                /**
                 * @todo Re-architect things so we don't use a brittle magic number.
                 *
                 * Places could have less than 100 units, and the not-actually-loaded
                 * bug could still happen with more than 100 features loaded.
                 */
                if (features.length < 100) {
                    // It says it's loaded, but this doesn't seem like enough
                    // features, so we don't believe it's loaded. We'll try
                    // again at the next `data` event.
                    this.onceLoaded(f);
                } else {
                    // Now we're convinced that it's loaded!
                    f();
                }
            } else {
                // It's not loaded yet, so we wait for the next `data` event.
                this.onceLoaded(f);
            }
        });
    }
}

function isString(x) {
    return typeof x === "string" || x instanceof String;
}

const getQueryFunction = getter => {
    // If it's a string key, get that property for each feature
    let queryFunction = f => f;
    if (getter !== undefined) {
        queryFunction = isString(getter)
            ? feature => feature.properties[getter]
            : getter;
    }
    return queryFunction;
};
