import LayerToggle from "./LayerToggle";

const colorScheme = {
    Democratic: []
};

function colorByMarginPerCapita(election, party, popKey) {
    let total = ["+"];
    for (let partyKey of election.parties) {
        total.push(["to-number", ["get", election.partiesToColumns[partyKey]]]);
    }
    const partyVotes = ["to-number", ["get", election.partiesToColumns[party]]];
    const population = ["get", popKey];
    return [
        "let",
        "margin",
        ["-", ["/", partyVotes, total], 0.5],
        [
            "interpolate",
            ["linear"],
            ["var", "proportion"],
            ...colorScheme[party]
        ]
    ];
}

export default class MarginPerCapita extends LayerToggle {
    constructor(unitsLayer, election, party, popKey) {
        const partyName = party;
        const layer = new Layer(
            unitsLayer.map,
            {
                id: `${election.id}-${party}-overlay`,
                source: unitsLayer.sourceId,
                "source-layer": unitsLayer.sourceLayer,
                type: "fill",
                paint: {
                    "fill-color": colorByConcentration(election, party, popKey),
                    "fill-opacity": 0
                }
            },
            (map, layer) => map.addLayer(layer, unitsLayer.id)
        );

        super(layer, `Show ${partyName} hotspots`);
    }
}
