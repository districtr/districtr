import { html } from "lit-html";
import Parameter from "../components/Parameter";
import select from "../components/select";
import { toggle } from "../components/Toggle";
import { colorByCount, colorByFraction } from "./color-rules";
import Overlay from "./Overlay";

export default class OverlayContainer {
    constructor(layers, columnSet, toggleText = "Show data layer") {
        this._currentSubgroupIndex = 0;
        this.subgroups = [...columnSet.subgroups, columnSet.total];

        const colorRule =
            this.subgroups.length > 1 ? colorByFraction : colorByCount;

        this.overlay = new Overlay(
            layers,
            this.subgroups[this._currentSubgroupIndex],
            colorRule
        );

        this.visibilityToggle = toggle(toggleText, false, visible => {
            if (visible) {
                this.overlay.show();
            } else {
                this.overlay.hide();
            }
        });

        this.changeSubgroup = this.changeSubgroup.bind(this);
        this.render = this.render.bind(this);
    }
    changeSubgroup(i) {
        if (this._currentSubgroupIndex === this.subgroups.length - 1) {
            this.overlay.setColorRule(colorByFraction);
        }
        this._currentSubgroupIndex = i;
        this.overlay.setSubgroup(this.subgroups[i]);
        if (i === this.subgroups.length - 1) {
            this.overlay.setColorRule(colorByCount);
        }
    }
    render() {
        return html`
            ${this.visibilityToggle}
            ${Parameter({
                label: "Variable:",
                element: select("subgroup", this.subgroups, this.changeSubgroup)
            })}
            ${Parameter({
                label: "Display as",
                element: select(
                    "layer-type",
                    this.overlay.layers.map(layer =>
                        getLayerDescription(layer)
                    ),
                    i => this.overlay.setLayer(i)
                )
            })}
        `;
    }
}

const layerDisplayNames = { circle: "sized circles", fill: "shaded regions" };

export function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}
