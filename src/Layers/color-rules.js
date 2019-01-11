import { partyColors } from "../colors";
import { divideOrZeroIfNaN } from "../utils";

// TODO: Include legends

// Demographic color rules:

export function colorByCount(subgroup) {
    return [
        "rgba",
        0,
        0,
        0,
        [
            "interpolate",
            ["linear"],
            subgroup.asMapboxExpression(),
            0,
            0,
            subgroup.population.max,
            1
        ]
    ];
}

export function colorByProportion(subgroup) {
    return [
        "rgba",
        0,
        0,
        0,
        divideOrZeroIfNaN(
            subgroup.asMapboxExpression(),
            subgroup.population.asMapboxExpression()
        )
    ];
}

export const demographicColorRules = [
    { name: "Total count", rule: colorByCount },
    { name: "Proportion", rule: colorByProportion }
];

// Partisan color rules:

function colorbyVoteShare(election, party, colorStops) {
    return [
        "let",
        "proportion",
        election.voteShareAsMapboxExpression(party),
        ["interpolate", ["linear"], ["var", "proportion"], ...colorStops]
    ];
}

function getPartisanColorStops(party) {
    let stops = [
        0,
        "rgba(0,0,0,0)",
        0.499,
        "rgba(0,0,0,0)",
        0.5,
        "rgba(249,249,249,0)"
    ];
    stops.push(1, partyColors[party]);

    return stops;
}

export function voteShareRule(election, party) {
    const colorStops = getPartisanColorStops(party);
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

export const createMarginPerCapitaRule = population => (election, party) => {
    let stops = [0, "rgba(249, 249, 249, 0)"];
    stops.push(1, partyColors[party]);

    return colorByMarginPerCapita(election, party, population, stops);
};
