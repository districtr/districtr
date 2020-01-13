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
        } else {
            this.overlay.setColorRule(colorByFraction);
        }

        // circle legend is 2D (percent x population total) except for population total itself
        document.querySelector(`#circles-${this._id}`).className = "circle-diagram " + (i ? "" : "raw-count");

        // widths 8-20-32, out of max width 40
        document.querySelector(`#circles-${this._id} .one-pop`).innerText = Math.round(this.subgroups[i].total.max * 0.04).toLocaleString();
        document.querySelector(`#circles-${this._id} .two-pop`).innerText = Math.round(this.subgroups[i].total.max * 0.25).toLocaleString();
        document.querySelector(`#circles-${this._id} .three-pop`).innerText = Math.round(this.subgroups[i].total.max * 0.64).toLocaleString();
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
                        document.querySelector(`#blocks-${this._id}`).style.display = i ? "none" : "block";
                        document.querySelector(`#circles-${this._id}`).style.display = i ? "block" : "none";
                    }
                )
            })}
            <div id="color-${this._id}" class="color-legend">
                <div id="blocks-${this._id}" class="square-container">
                    <span></span> <!-- empty firstchild for circle legend consistency -->
                    <span class="square"></span>
                    <span class="square"></span>
                    <span class="square"></span>
                    <span class="square"></span>
                    <span class="square"></span>

                    <div class="labels counts-${this._id}">
                        <span class="square">0</span>
                        <span class="square">1</span>
                        <span class="square">2</span>
                        <span class="square">3</span>
                        <span class="square">4</span>
                    </div>
                </div>
                <div id="circles-${this._id}" class="circle-diagram">
                    <div class="labels counts-${this._id}">
                        <span class="pop-label">Total Pop</span>
                        <span class="square">0</span>
                        <span class="square">1</span>
                        <span class="square">2</span>
                        <span class="square">3</span>
                        <span class="square">4</span>
                    </div>
                    <div class="circle-container">
                        <span class="pop-label three-pop">100x</span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                    </div>
                    <div class="circle-container">
                        <span class="pop-label two-pop">100x</span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                    </div>
                    <div class="circle-container">
                        <span class="pop-label one-pop">100x</span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                        <span class="circle square"></span>
                    </div>
                </div>
            </div>
        `;
    }
}

const layerDisplayNames = { circle: "sized circles", fill: "shaded regions" };

export function getLayerDescription(layer) {
    return { name: layerDisplayNames[layer.type] };
}
