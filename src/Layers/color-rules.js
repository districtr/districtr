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
            subgroup.total.max,
            1
        ]
    ];
}

export function colorByFraction(subgroup) {
    return ["rgba", 0, 0, 0, subgroup.fractionAsMapboxExpression()];
}

export const demographicColorRules = [
    { name: "Per capita", rule: colorByFraction },
    { name: "Total count", rule: colorByCount }
];

// Partisan color rules:

function colorbyVoteShare(election, party, colorStops) {
    return [
        "interpolate",
        ["linear"],
        election.voteShareAsMapboxExpression(party),
        ...colorStops
    ];
}

function getPartisanColorStops(party) {
    return [
        0,
        "rgba(0,0,0,0)",
        0.499,
        "rgba(0,0,0,0)",
        0.5,
        "rgba(249,249,249,0)",
        1,
        partyColors[party]
    ];
}

export function voteShareRule(election, party) {
    const colorStops = getPartisanColorStops(party);
    return colorbyVoteShare(election, party, colorStops);
}

function marginPerCapitaExpression(election, party, population) {
    return divideOrZeroIfNaN(
        election.marginAsMapboxExpression(party),
        population.asMapboxExpression()
    );
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
    let stops = [0, "rgba(249, 249, 249, 0)", 1, partyColors[party]];

    return colorByMarginPerCapita(election, party, population, stops);
};

export function createPartisanColorRules(state) {
    return [
        { name: "Vote share", rule: voteShareRule },
        {
            name: "Margin per capita",
            rule: createMarginPerCapitaRule(state.population)
        }
    ];
}
