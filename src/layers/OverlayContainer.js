import { html } from "lit-html";
import Parameter from "../components/Parameter";
import Select from "../components/Select";
import { toggle } from "../components/Toggle";
import { colorByCount, colorByFraction } from "./color-rules";
import Overlay from "./Overlay";

export default class OverlayContainer {
    constructor(id, layers, columnSet, toggleText) {
        this._id = id;
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

        this.changeSubgroup = this.changeSubgroup.bind(this);
        this.render = this.render.bind(this);

        if (window.location.search.includes("layer=")) {
            let layerSelect = window.location.search.split("layer=")[1].split("&")[0].toUpperCase();
            this.subgroups.forEach((sg, index) => {
                if (sg.key.toUpperCase() === layerSelect) {
                    this.changeSubgroup(index);
                    this.overlay.show();

                    if (window.location.search.includes("ltype=circle")) {
                        this.overlay.setLayer(1);
                    }
                }
            });
        }

        this.visibilityToggle = toggle(toggleText, (this._currentSubgroupIndex !== 0), visible => {
            document.getElementById("color-" + this._id).style.display
                = (visible ? "block" : "none");
            if (visible) {
                this.overlay.show();
                this.changeSubgroup(this._currentSubgroupIndex);
            } else {
                this.overlay.hide();
            }
        });
    }
    changeSubgroup(i) {
        this._currentSubgroupIndex = i;
        this.overlay.setSubgroup(this.subgroups[i]);
        document.getElementById("counts-" + this._id).style.display = "block";
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
                element: Select(
                    this.subgroups,
                    this.changeSubgroup,
                    this._currentSubgroupIndex
                )
            })}
            ${Parameter({
                label: "Display as",
                element: Select(
                    this.overlay.layers.map(layer =>
                        getLayerDescription(layer)
                    ),
                    (i) => {
                        this.overlay.setLayer(i);
                        document.querySelectorAll(`#color-${this._id} > .square`).forEach((sq) => {
                            sq.className = `square ${i ? 'circle' : 'block'}`;
                        });
                    }
                )
            })}
            <div id="color-${this._id}" class="color-legend">
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <br/>
                <div id="counts-${this._id}" class="labels">
                    <span class="square">0</span>
                    <span class="square">1</span>
                    <span class="square">2</span>
                    <span class="square">3</span>
                    <span class="square">4</span>
                </div>
            </div>
        `;
    }
}

const layerDisplayNames = { circle: "sized circles", fill: "shaded regions" };

export function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}
