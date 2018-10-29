import { render, svg } from "lit-html";

const width = 200;
const height = 200;
const gap = 1;

function barWidth(data) {
    return (width - (gap * data.length - 1)) / data.length;
}

function barHeight(d, maxValue) {
    if (d === 0 || maxValue == 0) {
        return 0;
    }
    return height * (d / maxValue);
}

const barChart = (data, maxValue, idealValue) => {
    const w = barWidth(data);
    const idealY = height - barHeight(idealValue, maxValue);
    return svg`
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${data.map((d, i) => {
        const barH = barHeight(d.value, maxValue);
        return svg`
    <rect width=${w} height=${barH} x="${i * (w + gap)}" y="${height -
            barH}" style="fill: ${d.color}"></rect>
    `;
    })}
    1
    ${
        idealValue > 0
            ? svg`<line x1="0" y1="${idealY}" x2="${width}" y2="${idealY}" stroke="black" />
                  <text x="${width - 30}" y="${idealY -
                  4}" fill="black" style="font-size: 0.8rem">Ideal</text>`
            : ""
    }
    </svg>
    `;
};

export default class PopulationBarChart {
    constructor(initialData, colors, total, attributeKey) {
        this.total = total;
        this.ideal = total / colors.length;
        this.maxDisplayValue = this.ideal * 2;

        this.data = initialData.map((v, i) => ({
            value: v,
            color: colors[i].name
        }));
        this.attributeKey = attributeKey;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(feature, color) {
        this.data[color].value += feature.properties[this.attributeKey];
        // Unassigned features have undefined color. We could avoid this by designating a
        // color for the unassigned features. That might be a good idea, because messing
        // with undefined seems misguided.
        if (feature.state.color !== undefined) {
            this.data[feature.state.color].value -=
                feature.properties[this.attributeKey];
        }
    }

    render() {
        const maxValueOrLargestDatum = Math.max(
            this.maxDisplayValue,
            ...this.data.map(d => d.value)
        );
        render(
            barChart(this.data, maxValueOrLargestDatum, this.ideal),
            document.getElementById("tally")
        );
    }
}
