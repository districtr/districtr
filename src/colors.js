const colorScheme = [
    "#0099cd",
    "#ffca5d",
    "#00cd99",
    "#99cd00",
    "#cd0099",
    "#9900cd",
    // Color brewer:
    "#8dd3c7",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    "#d9d9d9",
    "#bc80bd",
    "#ccebc5",
    "#ffed6f",
    "#ffffb3"
];
const hoverColorScheme = colorScheme.map(hex =>
    changeColorLuminance(hex, -0.3)
);

// I got this from stack overflow to adjust the color brewer colors
function changeColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    var rgb = "#",
        c,
        i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}

export const districtColors = colorScheme.map((hex, i) => ({
    id: i,
    name: hex,
    hex: hex,
    hoverHex: hoverColorScheme[i]
}));

// Right now I'm assuming colors are numbered, and that -1 or null means
// a block hasn't been colored. I don't think this is a good system.

const blockColorStyle = [
    "match",
    ["feature-state", "color"],
    ...districtColors
        .map((color, i) => [i, color.hex])
        .reduce((list, pair) => [...list, ...pair]),
    "rgba(0,0,0,0)"
];

const hoveredBlockColorStyle = [
    "match",
    ["feature-state", "color"],
    ...districtColors
        .map((color, i) => [i, color.hoverHex])
        .reduce((list, pair) => [...list, ...pair]),
    "#aaaaaa"
];

export const blockColorProperty = [
    "case",
    ["boolean", ["feature-state", "hover"], false],
    hoveredBlockColorStyle,
    blockColorStyle
];
