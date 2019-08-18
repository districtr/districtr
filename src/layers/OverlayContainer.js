import { html } from "lit-html";
import Parameter from "../components/Parameter";
import Select from "../components/Select";
import { toggle } from "../components/Toggle";
import { colorByCount, colorByFraction } from "./color-rules";
import Overlay from "./Overlay";

export default class OverlayContainer {
    constructor(layers, columnSet, toggleText) {
        this._currentSubgroupIndex = 0;
        this.subgroups = columnSet.columns;
        // These color rules should be explicitly attached to each subgroup,
        // instead of doing these brittle checks to try and figure out what's
        // appropriate.
        // Attaching them to the actual Subgroup instances would also make
        // it easier to unify OverlayContainer and PartisanOverlayContainer,
        // and to register new overlay types. Plugins could just register
        // their layer styles against columnSet/subgroup types.
        const colorRule =
            this.subgroups[0].total === this.subgroups[0]
                ? colorByCount
                : colorByFraction;

        this.overlay = new Overlay(
            layers,
            this.subgroups[this._currentSubgroupIndex],
            colorRule
        );

        if (!toggleText) {
            toggleText = columnSet.name
                ? `Show ${columnSet.name.toLowerCase()}`
                : "Show data layer";
        }

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
        this._currentSubgroupIndex = i;
        this.overlay.setSubgroup(this.subgroups[i]);
        if (this.subgroups[i].total === this.subgroups[i]) {
            this.overlay.setColorRule(colorByCount);
        } else {
            this.overlay.setColorRule(colorByFraction);
        }
    }
    render() {
        return html`
            <div class="ui-option ui-option--slim">
                ${this.visibilityToggle}
            </div>
            ${Parameter({
                label: "Variable:",
                element: Select(this.subgroups, this.changeSubgroup)
            })}
            ${Parameter({
                label: "Display as",
                element: Select(
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
