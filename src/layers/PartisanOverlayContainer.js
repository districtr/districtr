import { html } from "lit-html";
import { Parameter } from "../components/Parameter";
import Select from "../components/Select";
import { toggle } from "../components/Toggle";
import PartisanOverlay from "./PartisanOverlay";
import { getLayerDescription } from "./OverlayContainer";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

export default class PartisanOverlayContainer {
    constructor(layers, elections) {
        this.elections = elections.map(e => {
            let year = e.name.match(/\d+/)[0],
                office = e.name.replace(year, "").replace("Election", "").trim();
            e.name = i18n.elections.election_type.replace("OFFICE", i18n.elections[office] || office).replace("YEAR", year);
            return e;
        });
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
        if (this.isVisible || !this.currentElectionOverlay.repaint) {
            this.currentElectionOverlay.show();
        } else {
            this.currentElectionOverlay.repaint();
        }
    }
    render() {
        const overlay = this.currentElectionOverlay;
        return html`
            <h4>${i18n.editor.layers.partisanship}</h4>
            <div class="ui-option ui-option--slim">
                ${toggle(i18n.editor.layers.show_partisan, overlay.isVisible, checked =>
                    this.toggleVisibility(checked)
                )}
            </div>
            ${[
                {
                    label: `${i18n.elections.election}:`,
                    element: Select(
                        this.elections,
                        i => this.setElection(i),
                        this._currentElectionIndex
                    )
                },
                {
                    label: i18n.editor.layers.display,
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
