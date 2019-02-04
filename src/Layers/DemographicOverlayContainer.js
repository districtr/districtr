import { html } from "lit-html";
import Parameter from "../components/Parameter";
import select from "../components/select";
import { toggle } from "../components/Toggle";
import { demographicColorRules } from "./color-rules";
import DemographicOverlay from "./DemographicOverlay";

// TODO: I think we could improve the architecture of whatever's
// going on with all these "Container" components...
// This should be something I can put in the "components" folder,
// but right now it does too much other stuff.

export default class DemographicOverlayContainer {
    constructor(layers, population) {
        this.currentLayerIndex = 0;
        this.currentSubgroupIndex = 0;
        this.currentColorRuleIndex = 0;

        this.subgroups = [...population.subgroups, population.total];
        this.colorRules = demographicColorRules;

        this.layers = layers.map(
            layer =>
                new DemographicOverlay(
                    layer,
                    this.subgroups[this.currentSubgroupIndex],
                    this.colorRules[this.currentColorRuleIndex].rule
                )
        );

        this.visibilityToggle = toggle(
            "Show demographics data layer",
            false,
            visible => {
                if (visible) {
                    this.show();
                } else {
                    this.hide();
                }
            }
        );

        this.changeLayer = this.changeLayer.bind(this);
        this.changeSubgroup = this.changeSubgroup.bind(this);
        this.changeColorRule = this.changeColorRule.bind(this);
        this.render = this.render.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
    }
    show() {
        this.hide();
        this.layers[this.currentLayerIndex].setOpacity(0.8);
    }
    hide() {
        this.layers.forEach(layer => layer.setOpacity(0));
    }
    changeLayer(i) {
        this.currentLayerIndex = i;
        this.show();
    }
    changeSubgroup(i) {
        this.currentSubgroupIndex = i;
        this.layers.forEach(layer => layer.setSubgroup(this.subgroups[i]));
    }
    changeColorRule(i) {
        this.currentColorRuleIndex = i;
        this.layers.forEach(layer =>
            layer.setColorRule(this.colorRules[i].rule)
        );
    }
    render() {
        return html`
            <h4>Demographics</h4>
            ${this.visibilityToggle}
            ${Parameter({
                label: "Variable:",
                element: select("subgroup", this.subgroups, this.changeSubgroup)
            })}
            ${Parameter({
                label: "Color by",
                element: select(
                    "demographic-color-rule",
                    this.colorRules,
                    this.changeColorRule
                )
            })}
            ${Parameter({
                label: "Display as",
                element: select(
                    "demographic-layer-type",
                    this.layers.map(layer => getLayerDescription(layer)),
                    this.changeLayer
                )
            })}
        `;
    }
}

const layerDisplayNames = { circle: "sized circles", fill: "shaded regions" };

function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}
