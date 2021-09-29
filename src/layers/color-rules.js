import { parts } from "lit-html";
import { divideOrZeroIfNaN } from "../utils";

// TODO: Include legends
// TODO: Define a color rule interface, for extensibility and modularity.

/**
 * Default color scheme for the two major parties.
 */
export const partyRGBColors = {
    Democratic: [25, 118, 210],
    Republican: [211, 47, 47],

    Independent: [11, 102, 35],
    // PR
    "Nuevo Progresista": [102, 102, 204],
    "Popular Democrático": [255, 102, 51],

    // Chicago
    "Rahm Emanuel": [102, 102, 204],
    "Jesus \u201cChuy\u201d Garc\u00eda": [90,180,122],
    "Lori Lightfoot": [102, 102, 204],
    "Toni Preckwinkle": [90,180,122],

    // rent bipolar
    'Owner-occupied': [250,179,71],
    'Renter-occupied': [90,180,122],
};

/**
 * ColorBrewer colors for all non-major parties.
 */
let vizColors = [
    [102, 194, 165],
    [252, 141, 98],
    [141, 160, 203],
    [231, 138, 195],
    [166, 216, 84]
];

let cachedColors = {};

/**
 * Returns a color for the given party.
 * @param {String} name the party's name (e.g. Democratic)
 */
export function getPartyRGBColors(name) {
    if (partyRGBColors.hasOwnProperty(name)) {
        return partyRGBColors[name];
    }
    if (name.includes("(Dem)") || name.includes("Democratic")) {
        return partyRGBColors["Democratic"]
    }
    if (name.includes("(Rep)") || name.includes("Republican")) {
        return partyRGBColors["Republican"]
    }
    if (name.includes("(Ind)") || name.includes("Independent")) {
        return partyRGBColors["Independent"]
    }
    if (name.includes("Nuevo Progresista")) {
        return partyRGBColors["Nuevo Progresista"]
    }
    if (name.includes("Popular Democrático")) {
        return partyRGBColors["Popular Democrático"]
    }

    if (cachedColors.hasOwnProperty(name)) {
        return cachedColors[name];
    }
    let color = vizColors.shift();
    vizColors.push(color);
    cachedColors[name] = color;
    return color;
}

/**
 * Colors from transparent to black, according to the total count in each
 * unit (black == the maximum value). Currently only used for the total
 * population columns---should consider using population density instead.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a *-color property
 */
export function colorByCount(subgroup) {
    const rgb = [0, 0, 0];
    return [
        "rgba",
        ...rgb,
        [
            "interpolate",
            ["linear"],
            subgroup.asMapboxExpression(),
            0,
            0,
            (subgroup.divisor || 1) * Math.max(subgroup.total.max, subgroup.columnSet.total_alt ? subgroup.columnSet.total_alt.max : 0),
            1
        ]
    ];
}

export function purpleByCount(subgroup) {
    const rgb = [0, 0, 139];
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

/**
 * Sizes circles according to the total population count.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a circle-radius property
 */
export function sizeByCount(subgroup) {
    return [
        "interpolate",
        ["linear"],
        ["sqrt", subgroup.total.asMapboxExpression()],
        0,
        0,
        Math.sqrt(Math.max(subgroup.total.max, subgroup.columnSet.total_alt ? subgroup.columnSet.total_alt.max : 0)),
        20
    ];
}

/**
 * Colors from transparent to black, based on the subgroup's proportion
 * of the total count for the ColumnSet in each unit.
 * @param {Subgroup} subgroup
 * @returns {Array} Mapbox style for a *-color property
 */
export function colorByFraction(subgroup) {
    const rgb =
        subgroup.columnSet.type === "election"
            ? getPartyRGBColors(subgroup.name + subgroup.key)
            : [0, 0, 0];
    return ["rgba", ...rgb, subgroup.fractionAsMapboxExpression()];
}

export function purpleByFraction(subgroup) {
    const rgb = [0, 0, 139];
    return ["rgba", ...rgb, subgroup.fractionAsMapboxExpression()];
}

// Demographic color rules:

export const demographicColorRules = [
    { name: "Per capita", rule: colorByFraction },
    { name: "Total count", rule: colorByCount }
];

// Partisan color rules:

function colorbyVoteShare(party, colorStops, countyFilter) {
    if (countyFilter) {
      return [
        "case",
        countyFilter,
        colorbyVoteShare(party, colorStops),
        "rgba(0, 0, 0, 0)"
      ];
    }
    return [
        "interpolate",
        ["linear"],
        (["Democratic", "Republican"].includes(party.name)
          ? party.fractionAsMapboxExpression()
          : ["*", 1.2, party.fractionAsMapboxExpression()]
        ),
        ...colorStops
    ];
}

function getPartisanColorStops(party, num_parties) {
    // console.log(party);
    const rgb = getPartyRGBColors(party.name + party.key);
    const thresh = 1/num_parties;
    return [
        0,
        "rgba(0,0,0,0)",
        thresh - 0.001,
        "rgba(0,0,0,0)",
        thresh,
        "rgba(249,249,249,0)",
        1,
        `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`
    ];
}

export const voteShareRule = (num_parties, countyFilter) => (party) => {
    const colorStops = getPartisanColorStops(party, num_parties);
    return colorbyVoteShare(party, colorStops, countyFilter);
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
    const rgb = getPartyRGBColors(party.name);
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
