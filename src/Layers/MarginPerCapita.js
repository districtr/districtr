import { summarize } from "../utils";
import Layer from "./Layer";
import { partyColors } from "./PartisanOverlay";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

function marginPerCapitaExpression(election, party, population) {
    return [
        "let",
        "population",
        population.asMapboxExpression(),
        [
            "case",
            [">", ["var", "population"], 0],
            [
                "/",
                [
                    "max",
                    ["-", election.voteShareAsMapboxExpression(party), 0.5],
                    0
                ],
                ["var", "population"]
            ],
            0
        ]
    ];
}

function colorByMarginPerCapita(election, party, population, colorStops) {
    return [
        "let",
        "marginPerCapita",
        marginPerCapitaExpression(election, party, population),
        ["interpolate", ["linear"], ["var", "marginPerCapita"], ...colorStops]
    ];
}

function getFillColorRule(layer, population, election, party) {
    const data = layer.query(
        f =>
            population.getPopulation(f) > 0
                ? election.voteMargin(f, party) / population.getPopulation(f)
                : 0
    );
    const { max } = summarize(data);
    let colorStops = [0, "rgba(0,0,0,0)"];
    if (max > 0) {
        colorStops.push(max / 10, "#f9f9f9");
        colorStops.push(max, partyColors[party]);
    }
    return colorByMarginPerCapita(election, party, population, colorStops);
}

export default class MarginPerCapita extends Layer {
    constructor(unitsLayer, election, population, party) {
        console.log(getFillColorRule(unitsLayer, population, election, party));
        super(
            unitsLayer.map,
            {
                id: `${party}-mpc-overlay`,
                source: unitsLayer.sourceId,
                "source-layer": unitsLayer.sourceLayer,
                type: "fill",
                paint: {
                    "fill-color": getFillColorRule(
                        unitsLayer,
                        population,
                        election,
                        party
                    ),
                    "fill-opacity": 0
                }
            },
            (map, layer) => map.addLayer(layer, unitsLayer.id)
        );
        this.party = party;
        this.population = population;
    }
    changeElection(election) {
        this.setPaintProperty(
            "fill-color",
            getFillColorRule(this, this.population, election, this.party)
        );
    }
}
