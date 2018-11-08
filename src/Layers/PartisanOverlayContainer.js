import { html } from "lit-html";
import LayerToggle from "./LayerToggle";
import PartisanOverlay from "./PartisanOverlay";

export default class PartisanOverlayContainer {
    constructor(units, elections) {
        this.elections = elections;
        if (elections.length > 0) {
            this.demLayer = new PartisanOverlay(
                units,
                elections[0],
                "Democratic"
            );
            this.repLayer = new PartisanOverlay(
                units,
                elections[0],
                "Republican"
            );
            this.activeElection = 0;
        }

        this.demToggle = new LayerToggle(
            this.demLayer,
            `Show Democratic units`,
            false
        );
        this.repToggle = new LayerToggle(
            this.repLayer,
            `Show Republican units`,
            false
        );

        this.onChangeElection = this.onChangeElection.bind(this);
        this.render = this.render.bind(this);
    }
    onChangeElection(e) {
        this.activeElection = parseInt(e.target.value);
        this.demLayer.changeElection(this.elections[this.activeElection]);
        this.repLayer.changeElection(this.elections[this.activeElection]);
    }
    render() {
        return html`
            <label for="election-overlay"><h4>Overlay Partisan Lean</h4></label>
            <select name="election-overlay" @input="${this.onChangeElection}">
                ${
                    this.elections.map(
                        (election, i) => html`
                            <option value="${i}">${election.name}</option>
                        `
                    )
                }
            </select>
            ${this.repToggle.render()} ${this.demToggle.render()}
        `;
    }
}
