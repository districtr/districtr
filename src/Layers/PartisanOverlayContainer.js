import { html } from "lit-html";
import LayerToggle from "./LayerToggle";
import PartisanOverlay from "./PartisanOverlay";

export default class PartisanOverlayContainer {
    constructor(units, elections, layerTypes) {
        this.elections = elections;
        this.layerTypes = layerTypes;
        this.currentLayerType = 0;

        this.createLayers(units);
        this.createToggles();

        this.onChangeElection = this.onChangeElection.bind(this);
        this.onChangeLayerType = this.onChangeLayerType.bind(this);
        this.render = this.render.bind(this);
    }
    createToggles() {
        this.demToggle = new LayerToggle(
            this.demLayer,
            `Show Democratic-leaning units`,
            false
        );
        this.repToggle = new LayerToggle(
            this.repLayer,
            `Show Republican-leaning units`,
            false
        );
    }
    createLayers(units) {
        const colorRule = this.layerTypes[this.currentLayerType].rule;
        if (this.elections.length > 0) {
            this.demLayer = new PartisanOverlay(
                units,
                this.elections[0],
                "Democratic",
                colorRule
            );
            this.repLayer = new PartisanOverlay(
                units,
                this.elections[0],
                "Republican",
                colorRule
            );
            this.activeElection = 0;
        }
    }
    onChangeElection(e) {
        this.activeElection = parseInt(e.target.value);
        this.demLayer.changeElection(this.elections[this.activeElection]);
        this.repLayer.changeElection(this.elections[this.activeElection]);
    }
    onChangeLayerType(e) {
        this.currentLayerType = parseInt(e.target.value);
        const colorRule = this.layerTypes[this.currentLayerType].rule;
        this.demLayer.setFillColorRule(colorRule);
        this.repLayer.setFillColorRule(colorRule);
    }
    render() {
        return html`
            <label for="election-overlay"><h4>Overlay Partisan Lean</h4></label>
            <select name="layer-type" @input="${this.onChangeLayerType}">
                ${
                    this.layerTypes.map(
                        (type, i) =>
                            html`
                                <option value="${i}">${type.name}</option>
                            `
                    )
                }
            </select>
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
