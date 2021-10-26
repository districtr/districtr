/**
 * Global Districtr color map for districts.
 *
 * We might consider using fewer colors and just allowing repetitions,
 * since a human being can only hold so many colors in their head at
 * one time.
 */
let _colorScheme = [
    "#0099cd",
    "#ffca5d",
    "#00cd99",
    "#99cd00",
    "#cd0099",
    "#aa44ef", // lighter, req from San Diego
    // Color brewer:
    "#8dd3c7",
    "#bebada",
    "#fb8072",
    "#80b1d3",
    "#fdb462",
    "#b3de69",
    "#fccde5",
    // "#d9d9d9", Too gray!
    "#bc80bd",
    "#ccebc5",
    "#ffed6f",
    "#ffffb3",
    // other color brewer scheme:
    "#a6cee3",
    "#1f78b4",
    "#b2df8a",
    "#33a02c",
    "#fb9a99",
    "#e31a1c",
    "#fdbf6f",
    "#ff7f00",
    "#cab2d6",
    "#6a3d9a",
    //    "#ffff99",
    "#b15928",
    // random material design colors:
    "#64ffda",
    "#00B8D4",
    "#A1887F",
    "#76FF03",
    "#DCE775",
    "#B388FF",
    "#FF80AB",
    "#D81B60",
    "#26A69A",
    "#FFEA00",
    "#6200EA"
];

_colorScheme.push(..._colorScheme.map(hex => changeColorLuminance(hex, -0.3)));

/**
 * District color scheme.
 */
export const colorScheme = _colorScheme;

/**
 * Darker colors for when the user hovers over assigned units.
 */
const hoverColorScheme = colorScheme.map(hex =>
    changeColorLuminance(hex, -0.3)
);

/**
 * Adjusts the color luminance. Use it for shading colors.
 *
 * I got this from stack overflow to find shaded versions of the
 * ColorBrewer colors.
 *
 * @param {string} hex
 * @param {number} lum
 */
export function changeColorLuminance(hex, lum) {
    // validate hex string
    hex = String(hex).replace(/[^0-9a-f]/gi, "");
    if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    lum = lum || 0;

    // convert to decimal and change luminosity
    let rgb = "#",
        c,
        i;
    for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16);
        c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
        rgb += ("00" + c).substr(c.length);
    }

    return rgb;
}

/**
 * Global district color scheme, with both the normal hex and the hoverHex
 * variations included.
 */
export const districtColors = colorScheme.map((hex, i) => ({
    id: i,
    name: hex,
    hex: hex,
    hoverHex: hoverColorScheme[i]
}));

// Right now I'm assuming colors are numbered, and that -1 or null means
// a block hasn't been colored. I don't think this is a good system.

export function getUnitColorProperty(parts) {
    const unitColorStyle = [
        "match",
        ["feature-state", "color"],
        ...parts
            .map(part => [part.id, part.color])
            .reduce((list, pair) => [...list, ...pair]),
        "rgba(0, 0, 0, 0)"
    ];

    const hoveredUnitColorStyle = [
        "match",
        ["feature-state", "color"],
        ...parts
            .map(part => [part.id, part.hoverColor])
            .reduce((list, pair) => [...list, ...pair]),
        "#aaaaaa"
    ];

    const standardColor = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        hoveredUnitColorStyle,
        unitColorStyle
    ];

    const blendWithHoverOption = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        ["feature-state", "blendHoverColor"],
        ["feature-state", "blendColor"]
    ];

    const unitColorProperty = [
        "case",
        ["==", ["feature-state", "useBlendColor"], true],
        blendWithHoverOption,
        standardColor,
    ];

    return unitColorProperty;
}

export function blendColors (colors) {
    if (!colors || !Array.isArray(colors)) {
        return colors;
    }
    colors = colors.filter(c => c !== null);
    if (!colors.length) {
        return null;
    } else if (colors.length <= 1) {
        return colors[0] * 1;
    } else {
        let r = 0, g = 0, b = 0;
        colors.forEach((color) => {
            if (typeof color === 'number') {
                color = districtColors[color].hex;
            }

            r += parseInt("0x" + color.substring(1, 3));
            g += parseInt("0x" + color.substring(3, 5));
            b += parseInt("0x" + color.substring(5));
        });
        r = Math.round(r / colors.length).toString(16);
        g = Math.round(g / colors.length).toString(16);
        b = Math.round(b / colors.length).toString(16);
        if (r.length === 1) { r = '0' + r; }
        if (g.length === 1) { g = '0' + g; }
        if (b.length === 1) { b = '0' + b; }
        return '#' + [r, g, b].join('');
    }
}

/**
 * Mapbox color rule for the units layer.
 */

export const unitBordersPaintProperty = {
    "line-color": "#777777",
    "line-width": ["interpolate", ["linear"], ["zoom"], 0, 0, 7, 1],
    "line-opacity": 0.3
};

export const highlightUnassignedUnitBordersPaintProperty = {
    ...unitBordersPaintProperty,
    "line-color": [
        "case",
        ["==", ["feature-state", "color"], null],
        "#ff4f49",
        unitBordersPaintProperty["line-color"]
    ],
    "line-width": ["case", ["==", ["feature-state", "color"], null], 4, 1],
    "line-opacity": ["case", ["==", ["feature-state", "color"], null], 0.8, 0.3]
};
