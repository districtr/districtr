import { sizeByCount } from "./color-rules";
import Layer, { addBelowLabels } from "../map/Layer";
import { generateId } from "../utils";

export default class Overlay {
    constructor(layers, subgroup, defaultColorRule) {
        this.layers = layers.map(layer => createLayer(layer));

        this._currentLayerIndex = 0;
        this.colorRule = defaultColorRule;
        this.visible = false;

        this.setSubgroup = this.setSubgroup.bind(this);
        this.setLayer = this.setLayer.bind(this);
        this.setColorRule = this.setColorRule.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);

        this.setSubgroup(subgroup);
    }
    get currentLayer() {
        return this.layers[this._currentLayerIndex];
    }
    setLayer(i) {
        this._currentLayerIndex = i;
        if (this.visible) {
            this.show();
        } else {
            this.repaint();
        }
    }
    setSubgroup(subgroup) {
        this.subgroup = subgroup;
        this.repaint();
    }
    setColorRule(colorRule) {
        this.colorRule = colorRule;
        this.repaint();
    }
    show() {
        this.hide();
        this.repaint();
        this.currentLayer.setOpacity(0.7);
        this.visible = true;
    }
    hide() {
        this.visible = false;
        this.layers.forEach(layer => layer.setOpacity(0));
    }
    // Sets the overlay's paint style. Does _not_ change its visibility.
    repaint() {
        this.currentLayer.setColor(this.colorRule(this.subgroup));
        if (this.currentLayer.type === "circle") {
            this.currentLayer.setPaintProperty(
                "circle-radius",
                sizeByCount(this.subgroup)
            );
        }
    }
}

function createLayer(layer) {
    let layerSpec = {
        id: `${layer.id}-overlay-${generateId(8)}`,
        source: layer.sourceId,
        type: layer.type,
        paint: { [`${layer.type}-opacity`]: 0 }
    };
    if (layer.sourceLayer !== undefined) {
        layerSpec["source-layer"] = layer.sourceLayer;
    }
    return new Layer(layer.map, layerSpec, addBelowLabels);
}
