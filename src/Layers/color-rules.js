import { divideOrZeroIfNaN } from "../utils";

// TODO: Include legends
// TODO: Define a color rule interface, for extensibility and modularity.

// Demographic color rules:

const partyRGBColors = {
    Democratic: [25, 118, 210],
    Republican: [211, 47, 47]
};

export function colorByCount(subgroup) {
    const rgb = partyRGBColors[subgroup.name] || [0, 0, 0];
    return [
        "rgba",
        ...rgb,
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

export function sizeByCount(subgroup) {
    return [
        "interpolate",
        ["linear"],
        ["sqrt", subgroup.total.asMapboxExpression()],
        0,
        0,
        Math.sqrt(subgroup.total.max),
        20
    ];
}

export function colorByFraction(subgroup) {
    const rgb = partyRGBColors[subgroup.name] || [0, 0, 0];
    return ["rgba", ...rgb, subgroup.fractionAsMapboxExpression()];
}

export const demographicColorRules = [
    { name: "Per capita", rule: colorByFraction },
    { name: "Total count", rule: colorByCount }
];

// Partisan color rules:

function colorbyVoteShare(party, colorStops) {
    return [
        "interpolate",
        ["linear"],
        party.fractionAsMapboxExpression(),
        ...colorStops
    ];
}

function getPartisanColorStops(party) {
    const rgb = partyRGBColors[party.name];
    return [
        0,
        "rgba(0,0,0,0)",
        0.499,
        "rgba(0,0,0,0)",
        0.5,
        "rgba(249,249,249,0)",
        1,
        `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    ];
}

export function voteShareRule(party) {
    const colorStops = getPartisanColorStops(party);
    return colorbyVoteShare(party, colorStops);
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
    const rgb = partyRGBColors[party.name];
    let stops = [
        0,
        "rgba(249, 249, 249, 0)",
        1,
        `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    ];

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
