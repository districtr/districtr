import Layer from "./Layer";
import LayerToggle from "./LayerToggle";

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

export default class PartisanOverlay extends LayerToggle {
    constructor(unitsLayer, election, party, colorStops) {
        const partyName = party;
        const layer = new Layer(
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

        super(layer, `Show ${partyName} hotspots`);
    }
}
