import { sum, summarize } from "../utils";
import Layer from "./Layer";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

function colorByConcentration(election, party, colorStops) {
    let total = ["+"];
    for (let partyKey of election.parties) {
        total.push(["to-number", ["get", election.partiesToColumns[partyKey]]]);
    }
    const partyVotes = ["to-number", ["get", election.partiesToColumns[party]]];
    return [
        "let",
        "proportion",
        ["case", [">", partyVotes, 0], ["/", partyVotes, total], 0],
        ["interpolate", ["linear"], ["var", "proportion"], ...colorStops]
    ];
}

function getPartisanColorStops(color, data) {
    const { max } = summarize(data);
    let stops = [0, "rgba(0,0,0,0)", 0.499, "rgba(0,0,0,0)", 0.5, "#f9f9f9"];
    if (0.5 < max) {
        stops.push(max, color);
    }
    return stops;
}

const partyColors = {
    Democratic: "#0000ff",
    Republican: "#ff0000"
};

function getFillColorRule(layer, election, party) {
    const columns = election.parties.map(p => election.partiesToColumns[p]);
    const votesForParty = election.partiesToColumns[party];

    const percentages = layer.query(
        f =>
            sum(columns.map(c => f.properties[c])) > 0
                ? f.properties[votesForParty] /
                  sum(columns.map(c => f.properties[c]))
                : 0
    );

    const colorStops = getPartisanColorStops(partyColors[party], percentages);
    return colorByConcentration(election, party, colorStops);
}

export default class PartisanOverlay extends Layer {
    constructor(unitsLayer, election, party) {
        super(
            unitsLayer.map,
            {
                id: `${party}-overlay`,
                source: unitsLayer.sourceId,
                "source-layer": unitsLayer.sourceLayer,
                type: "fill",
                paint: {
                    "fill-color": getFillColorRule(unitsLayer, election, party),
                    "fill-opacity": 0
                }
            },
            (map, layer) => map.addLayer(layer, unitsLayer.id)
        );
        this.party = party;
    }
    changeElection(election) {
        this.setPaintProperty(
            "fill-color",
            getFillColorRule(this, election, this.party)
        );
    }
}
