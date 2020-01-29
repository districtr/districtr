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
        if (this.subgroups[i].total === this.subgroups[i]) {
            this.overlay.setColorRule(colorByCount);

            let total = this.subgroups[i].max;
            document.querySelectorAll("#counts-" + this._id + " .square").forEach((sq, index) => {
                let num = Math.floor(total * index / 5);
                if (num === 0 || total < 100000) {
                    if (num < 1000 || total < 15000) {
                        if (total < 2000) {
                            sq.innerText = Math.floor(Math.round(num / 10) * 10).toLocaleString();
                        } else {
                            sq.innerText = Math.floor(Math.round(num / 100) * 100).toLocaleString();
                        }
                    } else {
                        sq.innerText = Math.round(num / 1000) + "k";
                    }
                } else {
                    sq.innerText = Math.round(num / 1000) + "k";
                }
            });

            document.getElementById("counts-" + this._id).style.display = "block";
            document.getElementById("percents-" + this._id).style.display = "none";
        } else {
            this.overlay.setColorRule(colorByFraction);
            document.getElementById("counts-" + this._id).style.display = "none";
            document.getElementById("percents-" + this._id).style.display = "block";
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
                    }
                )
            })}
            <div id="color-${this._id}" class="color-legend">
                <span class="gradientbar"></span>
                <br/>
                <div id="notches-${this._id}" class="notches">
                    <span class="notch">|</span>
                    <span class="notch">|</span>
                    <span class="notch">|</span>
                    <span class="notch">|</span>
                    <span class="notch">|</span>
                    <span class="notch">|</span>
                </div>
                <div id="percents-${this._id}" class="labels">
                    <span class="square">0%</span>
                    <span class="square">20%</span>
                    <span class="square">40%</span>
                    <span class="square">60%</span>
                    <span class="square">80%</span>
                    <span class="square">100%</span>
                </div>
                <div id="counts-${this._id}" class="labels">
                    <span class="square">0</span>
                    <span class="square">1</span>
                    <span class="square">2</span>
                    <span class="square">3</span>
                    <span class="square">4</span>
                    <span class="square">5</span>
                </div>
            </div>
        `;
    }
}

const layerDisplayNames = { circle: "sized circles", fill: "shaded regions" };

export function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}
