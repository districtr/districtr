import { html } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import PartisanOverlay from "./PartisanOverlay";
import { getLayerDescription } from "./OverlayContainer";

export default class PartisanOverlayContainer {
    constructor(id, layers, elections) {
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
    }
    setElection(i) {
        this._currentElectionIndex = i;
        this.electionOverlays.forEach(overlay => overlay.hide());
        if (this.isVisible) {
            this.currentElectionOverlay.show();
        }
    }
    render() {
        const overlay = this.currentElectionOverlay;
        return html`
            <div class="ui-option ui-option--slim">
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
                    Show partisan lean
                </label>
            </div>
            ${[
                {
                    label: "Election:",
                    element: Select(
                        this.elections,
                        i => this.setElection(i),
                        this._currentElectionIndex
                    )
                },
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
            ].map(Parameter)}
        `;
    }
}
