import { sizeByCount } from "./color-rules";
import Layer, { addBelowLabels } from "./Layer";

export default class DemographicOverlay extends Layer {
    constructor(unitsLayer, subgroup, defaultColorRule) {
        let layerSpec = {
            id: `${unitsLayer.id}-population-overlay`,
            source: unitsLayer.sourceId,
            type: unitsLayer.type,
            paint: { [`${unitsLayer.type}-opacity`]: 0 }
        };
        if (unitsLayer.sourceLayer !== undefined) {
            layerSpec["source-layer"] = unitsLayer.sourceLayer;
        }

        super(unitsLayer.map, layerSpec, addBelowLabels);

        this.colorRule = defaultColorRule;
        this.setSubgroup = this.setSubgroup.bind(this);

        this.setSubgroup(subgroup);
        this.repaint();
    }
    setSubgroup(subgroup) {
        this.subgroup = subgroup;
        this.repaint();
    }
    setColorRule(colorRule) {
        this.colorRule = colorRule;
        this.repaint();
    }
    repaint() {
        this.setColor(this.colorRule(this.subgroup));
        if (this.type === "circle") {
            this.setPaintProperty("circle-radius", sizeByCount(this.subgroup));
        }
    }
}
