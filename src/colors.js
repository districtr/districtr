export const districtColors = [
    "#0099cd",
    "#cd9900",
    "#00cd99",
    "#99cd00",
    "#cd0099",
    "#9900cd"
];
export const districtHoverColors = [
    "#006b9c",
    "#9c6b00",
    "#009c6b",
    "#6b9c00",
    "#9c006b",
    "#6b009c"
];

// Right now I'm assuming colors are numbered, and that -1 or null means
// a block hasn't been colored. I don't think this is a good system.

const blockColorStyle = [
    "match",
    ["feature-state", "color"],
    ...districtColors
        .map((color, i) => [i, color])
        .reduce((list, pair) => [...list, ...pair]),
    "#f9f9f9"
];

const hoveredBlockColorStyle = [
    "match",
    ["feature-state", "color"],
    ...districtHoverColors
        .map((color, i) => [i, color])
        .reduce((list, pair) => [...list, ...pair]),
    "#aaaaaa"
];

export const blockColorProperty = [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    hoveredBlockColorStyle,
    blockColorStyle
];
