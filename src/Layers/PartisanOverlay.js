import { summarize } from "../utils";
import Layer from "./Layer";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

function colorbyVoteShare(election, party, colorStops) {
    return [
        "let",
        "proportion",
        election.voteShareAsMapboxExpression(party),
        ["interpolate", ["linear"], ["var", "proportion"], ...colorStops]
    ];
}

function getPartisanColorStops(party, data) {
    const { max } = summarize(data);

    let stops = [0, "rgba(0,0,0,0)", 0.499, "rgba(0,0,0,0)", 0.5, "#f9f9f9"];
    if (0.5 < max) {
        stops.push(max, partyColors[party]);
    }

    return stops;
}

export const partyColors = {
    Democratic: "#1976d2",
    Republican: "#d32f2f"
};

function getFillColorRule(layer, election, party) {
    const percentages = layer.query(f => election.voteShare(f, party));
    const colorStops = getPartisanColorStops(party, percentages);
    return colorbyVoteShare(election, party, colorStops);
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
        this.changeElection = this.changeElection.bind(this);

        // Awful hack to wait one second and refresh the fill color rule:
        window.setTimeout(() => this.changeElection(election), 2000);
        // The real problem is that we can't rely on querying the mapbox
        // vector tile source to get aggregate feature data, because there
        // is no guarantee that they'll load every feature. We'll need to
        // draw from CSV or json sent by the backend.
    }
    changeElection(election) {
        this.setPaintProperty(
            "fill-color",
            getFillColorRule(this, election, this.party)
        );
    }
}
