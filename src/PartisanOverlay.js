import { html } from "lit-html";
import Layer from "./Layer";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

function colorByConcentration(election, party, colorStops) {
    if (colorStops === undefined) {
        colorStops = repubColorStops;
    }
    let total = ["+"];
    for (let partyKey in election.parties) {
        total.push(["to-number", ["get", election.parties[partyKey]]]);
    }
    const partyVotes = ["to-number", ["get", election.parties[party]]];
    return [
        "let",
        "proportion",
        ["/", partyVotes, total],
        ["interpolate", ["linear"], ["var", "proportion"], ...colorStops]
    ];
}

export default class PartisanOverlay {
    constructor(unitsLayer, election, party, colorStops) {
        this.partyName = party;
        this.layer = new Layer(
            unitsLayer.map,
            {
                id: `${election}-${party}-overlay`,
                source: unitsLayer.sourceID,
                "source-layer": unitsLayer.sourceLayer,
                type: "fill",
                paint: {
                    "fill-color": colorByConcentration(
                        election,
                        party,
                        colorStops
                    ),
                    "fill-opacity": 0
                }
            },
            (map, layer) => map.addLayer(layer, unitsLayer.id)
        );
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        if (e.target.checked) {
            this.layer.setPaintProperty("fill-opacity", 0.8);
        } else {
            this.layer.setPaintProperty("fill-opacity", 0);
        }
    }
    render() {
        return html`
<label class="toolbar-checkbox-item">
<input type="checkbox"
@input=${this.onChange}>
Show ${this.partyName} hot spots
</label>
        `;
    }
}
