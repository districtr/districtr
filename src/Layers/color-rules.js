import { summarize } from "../utils";

// TODO: Make this work using a generic "election" record
// TODO: Include legend
// TODO: Consult with Ruth

export const partyColors = {
    Democratic: "#1976d2",
    Republican: "#d32f2f"
};

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

export function voteShareRule(layer, election, party) {
    const percentages = layer.query(f => election.voteShare(f, party));
    const colorStops = getPartisanColorStops(party, percentages);
    return colorbyVoteShare(election, party, colorStops);
}

function marginPerCapitaExpression(election, party, population) {
    return [
        "let",
        "pop",
        population.asMapboxExpression(),
        [
            "case",
            [">", ["var", "pop"], 0],
            ["/", election.marginAsMapboxExpression(party), ["var", "pop"]],
            0
        ]
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

export const createMarginPerCapitaRule = population => (
    layer,
    election,
    party
) => {
    const data = layer.query(f => {
        let pop = population.getPopulation(f);
        if (pop) {
            let margin = election.voteMargin(f, party);
            return margin / pop;
        }
        return 0;
    });

    const { max } = summarize(data);

    let stops = [0, "rgba(255, 255, 255, 0)"];
    if (max > 0) {
        stops.push(max, partyColors[party]);
    }

    return colorByMarginPerCapita(election, party, population, stops);
};
