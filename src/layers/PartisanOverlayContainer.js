import { html, render } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import PartisanOverlay from "./PartisanOverlay";
import { getLayerDescription } from "./OverlayContainer";
import { getPartyRGBColors } from "../layers/color-rules";

export default class PartisanOverlayContainer {
    constructor(id, layers, elections, toolbar, bipolarText) {
        this._id = id;
        this.elections = elections;
        this.layers = layers;
        this.electionOverlays = elections.map(
            election => new PartisanOverlay(layers, election)
        );
        this._currentElectionIndex = 0;
        this._inspection = toolbar.toolsById.inspect;
        this._toolbar = toolbar;

        this.setElection = this.setElection.bind(this);
        this.render = this.render.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.vote = "all";
        this.bipolarText = bipolarText;

        if (window.location.search.includes("layer=")) {
            let layerSelect = window.location.search.split("layer=")[1].split("&")[0].toUpperCase();
            elections.forEach((el, index) => {
                el.subgroups.forEach(sg => {
                    if (sg.key.toUpperCase() === layerSelect) {
                        this.setElection(index);
                        if (window.location.search.includes("ltype=circle")) {
                            this.currentElectionOverlay.setLayer(1);
                        }
                    }
                });
            });
        }
    }
    get currentElectionOverlay() {
        return this.electionOverlays[this._currentElectionIndex];
    }
    toggleVisibility(visible) {
        this.isVisible = visible;
        if (this.isVisible) {
            this.currentElectionOverlay.show();
        } else {
            this.currentElectionOverlay.hide();
        }
        if (this.bipolarText) {
            // get last word of label ("Renter") to show/hide color scale
            let colorLabel = this.bipolarText.split(" ");
            document.querySelector('#color-' + colorLabel[colorLabel.length - 1]).style.visibility = this.isVisible ? "visible" : "hidden";
        }
    }
    setElection(i) {
        this._currentElectionIndex = i;
        this.electionOverlays.forEach(overlay => overlay.hide());
        if (this.isVisible) {
            this.currentElectionOverlay.show(this.vote);
        }
        this.syncInspectTool();

        const target = document.getElementById("candidate-legend");
        if (target === null) {
            return;
        }
        render(this.candidateLegend(), target);
    }

    syncInspectTool() {
        console.log("syncing")
        console.log(this._inspection);
        const curElect = this.elections[this._currentElectionIndex].name;
        const inspectIndex = this._inspection.columnSets.findIndex(cs => cs.name === curElect);
        // console.log(curElect);
        // console.log(this._inspection.columnSets[inspectIndex]);
        this._inspection.changeColumnSetByIndex(inspectIndex);
        if (this._inspection.active) {
            const target = document.getElementById("toolbar");
            if (target === null) {
                return;
            }
            render(this._toolbar.render(), target);
        }
    }

    selectVote(type) {
        this.vote = type;
        this.setElection(this._currentElectionIndex);
    }

    candidateLegend() {
        const cands = this.elections[this._currentElectionIndex].subgroups;
        // console.log(cands);
        return cands.map(c => html`
                                <li class="party-desc">
                                    <span style="background-color:rgba(${getPartyRGBColors(c.name + c.key).join(",")}, 0.8)"></span>
                                    <span>${c.name}</span>
                                </li>`);
    }

    render() {
        const overlay = this.currentElectionOverlay;
        
        
        return html`
            <div id="candidate-legend">${this.candidateLegend()}</div>
            <div class="ui-option ui-option--slim">
                <h5>
                  <label class="toolbar-checkbox">
                      <input
                          type="checkbox"
                          name="data_layers"
                          ?checked="${overlay.isVisible}"
                          value="partisan"
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
                              this.toggleVisibility(e.target.checked);
                          }}
                      />
                      ${this.bipolarText || "Show partisan lean"}
                  </label>
                </h5>
            </div>
            ${[
                this.bipolarText ? null : {
                    label: "Election:",
                    element: Select(
                        this.elections,
                        i => this.setElection(i),
                        this._currentElectionIndex
                    )
                },
                this.elections[0].alternate ? {
                    label: "Absentee:",
                    element: html`<div class="yrselect parameter">
                      <label>
                        <input
                          type="radio"
                          name="${this._id + 'vote'}"
                          value="all"
                          ?checked="${this.vote === 'all'}"
                          @change="${e => this.selectVote('all')}"
                        />
                        Included
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="${this._id + 'vote'}"
                          value="in-person"
                          ?checked="${this.vote === 'in-person'}"
                          @change="${e => this.selectVote('in-person')}"
                        />
                        Excluded
                      </label>
                    </div>`
                } : null,
                {
                    label: "Display as",
                    element: Select(
                        this.layers.map(layer => getLayerDescription(layer)),
                        i =>
                            this.electionOverlays.forEach(overlay =>
                                overlay.setLayer(i)
                            )
                    )
                }
            ].filter(x => x !== null).map(Parameter)}
        `;
    }
}
