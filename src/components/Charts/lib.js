export function getColorsToDisplay(parts, populationData) {
    return parts
        .filter((part, i) => part.visible && Math.round(populationData[i]) > 0)
        .map(part => part.color);
}

export function barHeight(data, chartHeight, gap) {
    return (chartHeight - (gap * data.length - 1)) / data.length;
}

export function pctDeviationFromIntegerMultiple(d, ideal) {
    const over =
        (d - Math.max(numberOfSeats(d, ideal)) * ideal) /
        (Math.max(1, numberOfSeats(d, ideal)) * ideal);
    if (over > 0.5) {
        return over - 1;
    } else {
        return over;
    }
}

export function barLength(deviation, maxBarLength) {
    return Math.abs(deviation) * maxBarLength;
}

export function barPosition(deviation, width) {
    if (deviation > 0) {
        return width / 2;
    } else {
        return width / 2 - barLength(deviation, width / 2);
    }
}

export function labelPosition(deviation, gap, width) {
    if (deviation > 0) {
        return (
            barPosition(deviation, width) +
            barLength(deviation, width / 2) +
            gap
        );
    } else {
        return barPosition(deviation, width) - gap;
    }
}

export function numberOfSeats(d, ideal) {
    return Math.round(d / ideal);
}
