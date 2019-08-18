import { isString } from "../utils";

// The addBelowLabels method gives the right look on the Mapbox "streets" basemap,
// while addBelowSymbols gives the right look on the "light" basemap.

/**
 * Add the layer to the map below the first label layer (e.g. street names).
 * @param {mapboxgl.Map} map
 * @param {Layer} layer
 */
export function addBelowLabels(map, layer) {
    const layers = map.getStyle().layers;
    const firstSymbolId = getFirstLabelId(layers);
    map.addLayer(layer, firstSymbolId);
}

export function addBelowSymbols(map, layer) {
    const layers = map.getStyle().layers;
    const firstSymbolId = getFirstSymbolId(layers);
    map.addLayer(layer, firstSymbolId);
}

/**
 * @param {Object[]} layers list of layers from the Mapbox map's style
 * @returns {string} id of the first id with "label" in the name
 */
function getFirstLabelId(layers) {
    for (let i = 0; i < layers.length; i++) {
        if (layers[i].id.includes("label")) {
            return layers[i].id;
        }
    }
}

function getFirstSymbolId(layers) {
    for (let i = 0; i < layers.length; i++) {
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

        this.getFeature = this.getFeature.bind(this);
    }
    setOpacity(opacity) {
        this.setPaintProperty(`${this.type}-opacity`, opacity);
    }
    setColor(color) {
        this.setPaintProperty(`${this.type}-color`, color);
    }
    getColor() {
        return this.getPaintProperty(`${this.type}-color`);
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
    queryRenderedFeatures() {
        return this.map.queryRenderedFeatures(null, { layers: [this.id] });
    }
    querySourceFeatures() {
        return this.map.querySourceFeatures(this.sourceId, {
            sourceLayer: this.sourceLayer
        });
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
    untilSourceLoaded(callback) {
        if (this.map.isSourceLoaded(this.sourceId)) {
            return callback();
        }
        const handler = () =>
            callback(() => this.map.off("sourcedata", handler));
        this.map.on("sourcedata", handler);
    }
}
