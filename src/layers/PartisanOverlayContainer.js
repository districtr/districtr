import { html } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import PartisanOverlay from "./PartisanOverlay";
import { getLayerDescription } from "./OverlayContainer";

export default class PartisanOverlayContainer {
    constructor(id, layers, elections, bipolarText) {
        this._id = id;
        this.elections = elections;
        this.layers = layers;
        this.electionOverlays = elections.map(
            election => new PartisanOverlay(layers, election)
        );
        this._currentElectionIndex = 0;

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
            document.querySelector(".custom-party-list").style.display = "block";
        } else {
            this.currentElectionOverlay.hide();
            document.querySelector(".custom-party-list").style.display = "none";
        }
        if (this.bipolarText) {
            // get last word of label ("Renter") to show/hide color scale
            let colorLabel = this.bipolarText.split(" ");
            document.querySelector('#color-' + colorLabel[colorLabel.length - 1]).style.visibility = this.isVisible ? "visible" : "hidden";
        }
    }
    setElection(i) {
        this._currentElectionIndex = i;

        if (this.electionOverlays.length > 1) {
            let candidates = Array.from(document.querySelectorAll(".party-desc")).reverse();
            candidates.forEach((c, cdex) => {
                c.style.display = (cdex === i * 2 || cdex === i * 2 + 1) ? "list-item" : "none";
            });
        }

        this.electionOverlays.forEach(overlay => overlay.hide());
        if (this.isVisible) {
            this.currentElectionOverlay.show(this.vote);
        }
    }
    selectVote(type) {
        this.vote = type;
        this.setElection(this._currentElectionIndex);
    }
    render() {
        const overlay = this.currentElectionOverlay;
        return html`
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
