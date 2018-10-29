import { html, render, svg } from "lit-html";

const width = 240;
const height = 300;
const gap = 2;

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
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" style="background: #eee">
    ${data.map((d, i) => {
        const barH = barHeight(d.value, maxValue);
        return svg`
    <rect
        width=${w}
        height=${barH}
        x="${i * (w + gap)}"
        y="${height - barH}"
        style="fill: ${d.color}"
    ></rect>
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

const extra = 20;

const horizontalBarChart = (data, maxValue, idealValue) => {
    const w = barWidth(data);
    const idealY = height - barHeight(idealValue, maxValue);
    return svg`
    <svg viewBox="0 0 ${height} ${width +
        extra}" width="${height}" height="${width + extra}" class="bar-chart">
    ${data.map((d, i) => {
        const barH = barHeight(d.value, maxValue);
        return svg`
    <rect
        width="${barH}"
        height="${w}"
        x="0"
        y="${i * (w + gap)}"
        style="fill: ${d.color}"
    ></rect>`;
    })}
    ${
        idealValue > 0
            ? svg`<line x1="${height - idealY}" y1="${0}" x2="${height -
                  idealY}" y2="${width + extra}" stroke="#aaa" />
                  <text x="${height - idealY + 3}" y="${width +
                  extra -
                  4}" fill="black" style="font-size: 0.8rem">Ideal</text>`
            : ""
    }
    ${data.map((d, i) => {
        const barH = barHeight(d.value, maxValue);
        return barH > 0
            ? svg`
    <text
        x="${barH + 2 * gap}"
        y="${i * (w + gap) + 16}">${numberWithCommas(d.value)}</text>
    `
            : "";
    })}
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

        const populationDeviations = this.data.map(
            d => Math.abs(d.value - this.ideal) / this.ideal
        );
        const maxPopDev = Math.max(...populationDeviations);

        render(
            html`
            ${horizontalBarChart(this.data, maxValueOrLargestDatum, this.ideal)}
            ${
                maxPopDev < 0.1
                    ? html`<dl class="report-data-list">
                    <dt>Largest Population Deviation</dt>
                    <dd>
                    ${Math.round(10000 * maxPopDev) / 100}%
                    </dd>
                    </dl>
            `
                    : ""
            }`,
            document.getElementById("tally")
        );
    }
}

// From https://stackoverflow.com/questions/2901102/
// how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
