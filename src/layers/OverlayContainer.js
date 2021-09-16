import { html } from "lit-html";
import Parameter from "../components/Parameter";
import Select from "../components/Select";
import { colorByCount, colorByFraction, purpleByCount, purpleByFraction } from "./color-rules";
import Overlay from "./Overlay";

export default class OverlayContainer {
    constructor(id, layers, columnSet, toggleText, firstOnly, includeCoalition, multiYear, percents, purpleHardcode) {
        this._id = id;
        this._currentSubgroupIndex = firstOnly ? 1 : 0;
        this.subgroups = columnSet.columns;
        this.firstOnly = firstOnly || false;
        this.multiYear = multiYear;
        this.yr = 2010;
        this.percents = percents;
        this.purpleHardcode = purpleHardcode;

        if (includeCoalition) {
            this.subgroups = this.subgroups.concat([]);
            this.subgroups.splice(1, 0, {
                key: "_COALITION",
                name: includeCoalition,
                columnSet: { type: "population" },
                asMapboxExpression: () => ["get", this.subgroups[0].key],
                fractionAsMapboxExpression: () => [
                    "case",
                    ["==", ["get", columnSet.total.key], 0],
                        0,
                    [
                        "/",
                        ["+"].concat(this.subgroups
                            .filter(sg => window.coalitionGroups[sg.key])
                            .map(sg => ["get", sg.key])
                        ),
                        columnSet.total.asMapboxExpression()
                    ]
                ],
                total: columnSet.total
            });

            if (multiYear) {
                this.subgroups.push({
                    key: "_COALITIONX",
                    name: `${includeCoalition} (${this.multiYear})`,
                    columnSet: { type: "population" },
                    asMapboxExpression: () => ["get", this.subgroups[0].key],
                    fractionAsMapboxExpression: () => [
                        "case",
                        ["==", ["get", columnSet.total_alt.key], 0],
                            0,
                        [
                            "/",
                            ["+"].concat(this.subgroups
                                .filter(sg => window.coalitionGroups[sg.key])
                                .map(sg => ["get", sg.key + "X"])
                            ),
                            columnSet.total_alt.asMapboxExpression()
                        ]
                    ],
                    total: columnSet.total_alt
                });
            }
        }

        // These color rules should be explicitly attached to each subgroup,
        // instead of doing these brittle checks to try and figure out what's
        // appropriate.
        // Attaching them to the actual Subgroup instances would also make
        // it easier to unify OverlayContainer and PartisanOverlayContainer,
        // and to register new overlay types. Plugins could just register
        // their layer styles against columnSet/subgroup types.
        let colorRule =
            ((this.firstOnly || this.percents || this.purpleHardcode) ? purpleByCount
              : ((this.subgroups[0].total === this.subgroups[0])
                  ? colorByCount
                  : colorByFraction)
            );

        this.overlay = new Overlay(
            layers,
            this.subgroups[this._currentSubgroupIndex],
            colorRule
        );

        if (!toggleText) {
            toggleText = columnSet.name
                ? columnSet.name
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

        this.visibilityToggle = html`<label class="toolbar-checkbox">
            <input
                type="checkbox"
                name="data_layers"
                ?checked="${!this.firstOnly && this._currentSubgroupIndex !== 0}"
                value="${this._id}"
                @change=${(e) => {
                    if (e.bubbles) {
                        let checks = document.getElementsByName("data_layers");
                        for (let c = 0; c < checks.length; c++) {
                            if (checks[c].value !== this._id) {
                                checks[c].checked = false;
                                let evt = new Event("change");
                                checks[c].dispatchEvent(evt);
                            }
                        }
                    }
                    let visible = e.target.checked;
                    document.getElementById("color-" + this._id).style.display = (visible ? "block" : "none");
                    if (visible) {
                        this.overlay.show();
                        this.changeSubgroup(this._currentSubgroupIndex);
                    } else {
                        this.overlay.hide();
                    }
                }}
            />
            ${toggleText}
        </label>`;
    }
    changeSubgroup(i) {
        this._currentSubgroupIndex = i;
        if (this.yr === this.multiYear) {
            while(this.subgroups[i] &&
                (!this.subgroups[i].name.includes(`(${this.multiYear})`)
                || !this.subgroups[i].name.includes(this.subgroups[this._currentSubgroupIndex].name))) {
                i++;
            }
        }
        this.overlay.setSubgroup(this.subgroups[i]);
        if (this.percents) {
            // layer with 0.0 to 1.0 range
            this.overlay.setColorRule(purpleByCount);
            document.getElementById("counts-" + this._id).style.display = "none";
            document.getElementById("percents-" + this._id).style.display = "block";
        } else if (this.firstOnly || (this.subgroups[i].total === this.subgroups[i]) || (this.subgroups[i].key.includes("TOTPOP"))) {
            if (this.firstOnly || this.purpleHardcode) {
                this.overlay.setColorRule(purpleByCount);
            } else {
                this.overlay.setColorRule(colorByCount);
            }

            // set 100% pop to max of 2010/2018/2019 year toggle
            let total = Math.max(this.subgroups[i].max, this.subgroups[i].columnSet.total_alt
                ? this.subgroups[i].columnSet.total_alt.max
                : 0);

            document.querySelectorAll("#counts-" + this._id + " .square").forEach((sq, index) => {
                let num = Math.floor(total * index / 5);
                if (num === 0 || total < 100000) {
                    if (num < 1000 || total < 10000) {
                        if (total < 1000) {
                            sq.innerText = Math.floor(Math.round(num / 10) * 10).toLocaleString();
                        } else if (total === 3000 && num === 3000) {
                            sq.innerText = "≥3,000";
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
            if (this.purpleHardcode) {
                this.overlay.setColorRule(purpleByFraction);
            } else {
                this.overlay.setColorRule(colorByFraction);
            }
            document.getElementById("counts-" + this._id).style.display = "none";
            document.getElementById("percents-" + this._id).style.display = "block";
        }
    }
    selectYear(yr) {
        this.yr = yr;
        this.changeSubgroup(this._currentSubgroupIndex);
    }
    render() {
        return html`
            <div class="ui-option ui-option--slim">
                <h5>${this.visibilityToggle}</h5>
            </div>
            ${this.firstOnly ? "" :
                Parameter({
                    label: "Variable:",
                    element: Select(
                        this.subgroups.filter(sg => !this.multiYear || !sg.name.includes(`(${this.multiYear})`)),
                        this.changeSubgroup,
                        this._currentSubgroupIndex
                    )
                })
            }
            ${this.multiYear
              ? html`<div class="yrselect parameter">
                <label class="parameter__label ui-label ui-label--row">Year</label>
                <label>
                  <input
                    type="radio"
                    name="${this._id + 'yr'}"
                    value="2010"
                    ?checked="${this.yr === 2010}"
                    @change="${e => this.selectYear(2010)}"
                  />
                  2010
                </label>
                <label>
                  <input
                    type="radio"
                    name="${this._id + 'yr'}"
                    value="${this.multiYear}"
                    ?checked="${this.yr === this.multiYear}"
                    @change="${e => this.selectYear(this.multiYear)}"
                  />
                  ${this.multiYear}
                </label>
              </div>`
              : ""
            }
            ${(this.firstOnly || this.percents) ? "" :
                Parameter({
                    label: "Display as",
                    element: Select(
                        this.overlay.layers.map(layer =>
                            getLayerDescription(layer)
                        ),
                        (i) => {
                            this.overlay.setLayer(i);
                        }
                    )
                })
            }
            <div id="color-${this._id}" class="color-legend">
                <span class="gradientbar ${(this.firstOnly || this.percents || this.purpleHardcode) ? 'purple' : ''}"></span>
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
