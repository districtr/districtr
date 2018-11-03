import { summarize } from "../utils";
import Layer from "./Layer";
import { partyColors } from "./PartisanOverlay";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

function marginPerCapitaExpression(election, party, population) {
    return [
        "/",
        election.marginAsMapboxExpression(party),
        population.asMapboxExpression()
    ];
}

function colorByMarginPerCapita(election, party, population, colorStops) {
    return [
        "interpolate",
        ["linear"],
        marginPerCapitaExpression(election, party, population),
        ...colorStops
    ];
}

function getFillColorRule(layer, population, election, party) {
    const data = layer.query(
        f =>
            population.getPopulation(f) > 0
                ? election.voteMargin(f, party) / population.getPopulation(f)
                : 0
    );
    const { min, max } = summarize(data);
    // TODO: Make sure parties point the right way
    // Fix this
    let colorStops = [
        min,
        partyColors.Republican,
        0,
        "#f9f9f9",
        max,
        partyColors.Democratic
    ];
    // if (max > 0) {
    // colorStops.push(max / 10, "#f9f9f9");
    // colorStops.push(max, partyColors[party]);
    // }
    return colorByMarginPerCapita(election, party, population, colorStops);
}

export default class MarginPerCapita extends Layer {
    constructor(unitsLayer, election, population, party) {
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
