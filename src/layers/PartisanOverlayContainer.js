import { html } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import { toggle } from "../components/Toggle";
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
        document.getElementById("color-" + this._id).style.display
            = (visible ? "block" : "none");
        if (this.isVisible) {
            this.currentElectionOverlay.show();
            this.setElection(this._currentElectionIndex);
        } else {
            this.currentElectionOverlay.hide();
        }
    }
    setElection(i) {
        this._currentElectionIndex = i;
        this.electionOverlays.forEach(overlay => overlay.hide());
        if (this.isVisible || !this.currentElectionOverlay.repaint) {
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
            <div id="color-${this._id}" class="color-legend partisan-legend">
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <span class="square"></span>
                <br/>
                <div class="labels show-default">
                    <span class="square">75% D</span>
                    <span class="square">65% D</span>
                    <span class="square">55% D</span>
                    <span class="square">55% R</span>
                    <span class="square">65% R</span>
                    <span class="square">75% R</span>
                </div>
            </div>
        `;
    }
}
