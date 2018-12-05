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

function select(name, items, handler) {
    return html`
        <select
            name="${name}"
            @input="${e => handler(parseInt(e.target.value))}"
        >
            ${
                items.map(
                    (item, i) => html`
                        <option value="${i}">${item.name}</option>
                    `
                )
            }
        </select>
    `;
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
        this.onChangeLayerType = this.onChangeLayerType.bind(this);
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
            this.layerTypes = [{ name: "Polygons" }, { name: "Points" }];
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
    onChangeElection(i) {
        this.activeElection = i;
        this.forEachLayer(layer =>
            layer.changeElection(this.elections[this.activeElection])
        );
    }
    onChangeLayerStyle(i) {
        this.currentLayerStyle = i;
        const colorRule = this.layerStyles[this.currentLayerStyle].rule;
        this.forEachLayer(layer => layer.setFillColorRule(colorRule));
    }
    onChangeLayerType(i) {
        this.currentLayerType = i;
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
            <h4>Partisanship</h4>
            ${
                [
                    {
                        label: "Statistic",
                        element: select(
                            "layer-style",
                            this.layerStyles,
                            this.onChangeLayerStyle
                        )
                    },
                    {
                        label: "Election",
                        element: select(
                            "election-overlay",
                            this.elections,
                            this.onChangeElection
                        )
                    },
                    {
                        label: "Display as",
                        element: select(
                            "layer-type",
                            this.layerTypes,
                            this.onChangeLayerType
                        )
                    }
                ].map(
                    ({ label, element }) =>
                        html`
                            <div class="layer-list__item">
                                <label class="layer-list__label">${label}</label
                                >${element}
                            </div>
                        `
                )
            }
            ${this.toggles.map(toggle => toggle.render())}
        `;
    }
}
