export function zeros(n) {
    let vector = [];
    for (let i = 0; i < n; i++) {
        vector.push(0);
    }
    return vector;
}

/**
 * Summarize an array of data. Returns `{min, max, total, length}`.
 *
 * @param {string or function} getter The string key of one of the feature's
 *  properties, or a function mapping each feature to the desired data.
 */
export function summarize(data) {
    return {
        min: Math.min(...data),
        max: Math.max(...data),
        total: sum(data),
        length: data.length
    };
}

// From https://stackoverflow.com/questions/2901102/
// how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298
export function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function roundToDecimal(n, places) {
    return Math.round(n * Math.pow(10, places)) / Math.pow(10, places);
}

export function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

/**
 * Adds margins to a bounds array.
 * @param {number[][]} bounds - [[minx, miny], [maxx, maxy]]
 * @param {number[]} percents - The margin, measured by percent, to add to
 *  the top, right, bottom, and left of the box.
 * @returns {number[][]} bounds with margin added to each edge
 */
export function withMargins(bounds, percents) {
    const width = bounds[1][0] - bounds[0][0];
    const height = bounds[1][1] - bounds[0][1];
    return [
        [
            getLongitude(bounds[0][0] - percents[3] * width),
            getLatitude(bounds[0][1] - percents[2] * height)
        ],
        [
            getLongitude(bounds[1][0] + percents[1] * width),
            getLatitude(bounds[1][1] + percents[0] * height)
        ]
    ];
}

/**
 * Convert a number x to longitude (x mod 180)
 * @param {number} x
 */
function getLongitude(x) {
    if (x < -180) {
        return x + 360;
    }
    if (x >= 180) {
        return x - 360;
    }
    return x;
}

/**
 * Convert a number y to latitude (y mod 90)
 * @param {number} y
 */
function getLatitude(y) {
    if (y < -90) {
        return y + 180;
    }
    if (y >= 90) {
        return y - 180;
    }
    return y;
}
