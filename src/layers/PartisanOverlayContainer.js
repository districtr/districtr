import { html } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import { toggle } from "../components/Toggle";
import PartisanOverlay from "./PartisanOverlay";
import { getLayerDescription } from "./OverlayContainer";

export default class PartisanOverlayContainer {
    constructor(layers, elections) {
        this.elections = elections;
        this.layers = layers;
        this.electionOverlays = elections.map(
            election => new PartisanOverlay(layers, election)
        );
        this._currentElectionIndex = 0;

        this.setElection = this.setElection.bind(this);
        this.render = this.render.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
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
        } else {
            this.currentElectionOverlay.repaint();
        }
    }
    render() {
        const overlay = this.currentElectionOverlay;
        return html`
            <h4>Partisanship</h4>
            <div class="ui-option ui-option--slim">
                ${toggle(`Show partisan lean`, overlay.isVisible, checked =>
                    this.toggleVisibility(checked)
                )}
            </div>
            ${[
                {
                    label: "Election:",
                    element: Select(this.elections, i => this.setElection(i))
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
