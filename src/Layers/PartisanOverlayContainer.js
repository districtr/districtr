import { html } from "lit-html";
import Toggle from "../components/Toggle";
import PartisanOverlay from "./PartisanOverlay";

function createLayerToggle(layer) {
    return new Toggle(`Show ${layer.party}-leaning units`, false, checked => {
        if (checked) {
            layer.setOpacity(0.8);
        } else {
            layer.setOpacity(0);
        }
    });
}

export default class PartisanOverlayContainer {
    constructor(units, elections, layerTypes) {
        this.elections = elections;
        this.layerTypes = layerTypes;
        this.currentLayerType = 0;

        this.createLayers(units);
        this.toggles = this.layers.map(createLayerToggle);

        this.onChangeElection = this.onChangeElection.bind(this);
        this.onChangeLayerType = this.onChangeLayerType.bind(this);
        this.render = this.render.bind(this);
    }
    createLayers(units) {
        const colorRule = this.layerTypes[this.currentLayerType].rule;
        if (this.elections.length > 0) {
            this.layers = ["Democratic", "Republican"].map(
                party =>
                    new PartisanOverlay(
                        units,
                        this.elections[0],
                        party,
                        colorRule
                    )
            );
            this.activeElection = 0;
        } else {
            this.layers = [];
        }
    }
    onChangeElection(e) {
        this.activeElection = parseInt(e.target.value);
        this.layers.forEach(layer =>
            layer.changeElection(this.elections[this.activeElection])
        );
    }
    onChangeLayerType(e) {
        this.currentLayerType = parseInt(e.target.value);
        const colorRule = this.layerTypes[this.currentLayerType].rule;
        this.layers.forEach(layer => layer.setFillColorRule(colorRule));
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
            ${this.toggles.map(toggle => toggle.render())}
        `;
    }
}
