import { html } from "lit-html";
import Toggle from "../components/Toggle";
import PartisanOverlay from "./PartisanOverlay";

function createLayerToggle(party, showParty, hideParty) {
    return new Toggle(`Show ${party}-leaning units`, false, checked => {
        if (checked) {
            showParty(party);
        } else {
            hideParty(party);
        }
    });
}

export default class PartisanOverlayContainer {
    constructor(layerTypes, elections, layerStyles) {
        this.elections = elections;
        this.layerStyles = layerStyles;
        this.currentLayerStyle = 0;

        this.createLayers(layerTypes);

        this.partyVisiblity = { Democratic: false, Republican: false };

        this.showParty = this.showParty.bind(this);
        this.hideParty = this.hideParty.bind(this);
        this.showVisibleParties = this.showVisibleParties.bind(this);
        this.forEachLayer = this.forEachLayer.bind(this);
        this.onChangeElection = this.onChangeElection.bind(this);
        this.onChangeLayerStyle = this.onChangeLayerStyle.bind(this);
        this.render = this.render.bind(this);

        this.toggles = ["Democratic", "Republican"].map(party =>
            createLayerToggle(party, this.showParty, this.hideParty)
        );
    }
    showParty(party) {
        this.partyVisiblity[party] = true;
        this.showVisibleParties();
    }
    hideParty(party) {
        this.partyVisiblity[party] = false;
        this.showVisibleParties();
    }
    createLayers(layerTypes) {
        const colorRule = this.layerStyles[this.currentLayerStyle].rule;
        if (this.elections.length > 0) {
            this.layers = layerTypes.map(layer =>
                ["Democratic", "Republican"].map(
                    party =>
                        new PartisanOverlay(
                            layer,
                            this.elections[0],
                            party,
                            colorRule
                        )
                )
            );
            this.activeElection = 0;
            this.currentLayerType = 0;
        } else {
            this.layers = [];
        }
    }
    onChangeElection(e) {
        this.activeElection = parseInt(e.target.value);
        this.forEachLayer(layer =>
            layer.changeElection(this.elections[this.activeElection])
        );
    }
    onChangeLayerStyle(e) {
        this.currentLayerStyle = parseInt(e.target.value);
        const colorRule = this.layerStyles[this.currentLayerStyle].rule;
        this.forEachLayer(layer => layer.setFillColorRule(colorRule));
    }
    onChangeLayerType(e) {
        this.currentLayerType = parseInt(e.target.value);
        this.forEachLayer(layer => layer.setOpacity(0));
        this.showVisibleParties();
    }
    showVisibleParties() {
        this.layers[this.currentLayerType].forEach(layer => {
            if (this.partyVisiblity[layer.party]) {
                layer.setOpacity(0.8);
            } else {
                layer.setOpacity(0);
            }
        });
    }
    forEachLayer(f) {
        this.layers.forEach(layers => layers.forEach(f));
    }
    render() {
        return html`
            <label for="election-overlay"><h4>Overlay Partisan Lean</h4></label>
            <select name="layer-type" @input="${this.onChangeLayerStyle}">
                ${
                    this.layerStyles.map(
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
