import { html, svg } from "lit-html";
import { getPopulation } from "../context";
import Tally from "./Tally";
import { numberWithCommas, roundToDecimal } from "./utils";

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

const extra = 20;

const horizontalBarChart = (
    data,
    colors,
    maxValue,
    idealValue,
    formattedIdeal
) => {
    const w = barWidth(data);
    const idealY = height - barHeight(idealValue, maxValue);
    return svg`
    <svg viewBox="0 0 ${height} ${width +
        extra}" width="${height}" height="${width + extra}" class="bar-chart">
    ${data.map((d, i) => {
        const barH = barHeight(d, maxValue);
        return svg`
    <rect
        width="${barH}"
        height="${w}"
        x="0"
        y="${i * (w + gap)}"
        style="fill: ${colors[i]}"
    ></rect>`;
    })}
    ${
        idealValue > 0
            ? svg`<line x1="${height - idealY}" y1="${0}" x2="${height -
                  idealY}" y2="${width + extra}" stroke="#aaa" />
                  <text x="${height - idealY + 3}" y="${width +
                  extra -
                  4}" fill="#111">
                  Ideal:
                  ${formattedIdeal}
                  </text>`
            : ""
    }
    ${data.map((d, i) => {
        const barH = barHeight(d, maxValue);
        return barH > 0
            ? svg`
    <text
        x="${barH + 2 * gap}"
        y="${i * (w + gap) + 16}">${numberWithCommas(d)}</text>
    `
            : "";
    })}
    </svg>
    `;
};

export default class PopulationBarChart {
    constructor(initialData, colors, total) {
        this.total = total;
        this.ideal = total / colors.length;
        this.formattedIdeal = numberWithCommas(roundToDecimal(this.ideal, 2));
        this.maxDisplayValue = this.ideal * 2;

        this.tally = new Tally(getPopulation, initialData);
        this.colors = colors;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(feature, color) {
        this.tally.update(feature, color);
    }

    render() {
        const maxValueOrLargestDatum = Math.max(
            this.maxDisplayValue,
            ...this.tally.data
        );

        return html`
            <section>
            <h3>Population</h3>
            ${horizontalBarChart(
                this.tally.data,
                this.colors,
                maxValueOrLargestDatum,
                this.ideal,
                this.formattedIdeal
            )}
            </section>`;
    }
}
