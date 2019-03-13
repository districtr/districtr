import { html, svg } from "lit-html";
import { numberWithCommas } from "../../utils";
import { barHeight } from "./lib";

const defaultHeight = 240;
const width = 300;
const gap = 2;

function barLength(d, maxValue) {
    if (d === 0 || maxValue === 0) {
        return 0;
    }
    return width * (d / maxValue);
}

const extra = 20;

const horizontalBarChart = (population, parts) => {
    const data = population.total.tally.data;
    const maxValue = population.maxDisplayValue();
    const colors = parts.map(part => part.color);
    const formattedIdeal = population.formattedIdeal;

    const chartHeight = Math.max(defaultHeight, 12 * data.length);

    const w = barHeight(data, chartHeight, gap);
    const textHeight = Math.min(w + gap, 16);
    const idealX = width - barLength(population.ideal, maxValue);
    return svg`<svg viewBox="0 0 ${width} ${chartHeight +
        extra}" width="${width}" height="${chartHeight +
        extra}" class="bar-chart">
    ${data.map((d, i) => {
        const barW = barLength(d, maxValue);
        return svg`<rect
                    width="${barW}"
                    height="${w}"
                    x="0"
                    y="${i * (w + gap)}"
                    style="fill: ${colors[i]}"
                ></rect>`;
    })}
    ${
        population.ideal > 0
            ? svg`<line x1="${width - idealX}" y1="${0}" x2="${width -
                  idealX}" y2="${chartHeight + extra}" stroke="#aaa" />
                  <text x="${width - idealX + 3}" y="${chartHeight +
                  extra -
                  4}" fill="#111">
                  Ideal:
                  ${formattedIdeal}
                  </text>`
            : ""
    }
    ${data.map((d, i) => {
        const barW = barLength(d, maxValue);
        return Math.round(d) > 0
            ? svg`
    <text
        style="font-size: ${textHeight}px"
        x="${barW + 2 * gap}"
        y="${i * (w + gap) +
            w -
            (w + gap - textHeight) / 2}">${numberWithCommas(
                  Math.round(d)
              )}</text>`
            : "";
    })}
    </svg>
    `;
};

const populationBarChart = (population, parts) => html`
    <section class="toolbar-section">
        ${horizontalBarChart(population, parts)}
    </section>
`;

export default populationBarChart;
