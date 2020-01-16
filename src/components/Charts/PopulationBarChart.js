import { html, svg } from "lit-html";
import { numberWithCommas, roundToDecimal } from "../../utils";
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

/**
 * Returns a value to use as a maximum scale for the bar chart.
 */
function maxDisplayValue(population) {
    return Math.max(population.ideal * 2, ...population.total.data);
}

const horizontalBarChart = (population, parts) => {
    // Slice so that we only use active parts
    // Should we only use districts with population > 0?
    const data = population.total.data.slice(0, parts.length);
    const maxValue = maxDisplayValue(population);
    const colors = parts.map(part => part.color);
    const formattedIdeal = population.formattedIdeal;
    const deviations = population.deviations();

    const chartHeight = Math.max(defaultHeight, 12 * data.length);

    const w = barHeight(data, chartHeight, gap);
    const textHeight = Math.min(w + gap, 16);
    const idealX = width - barLength(population.ideal, maxValue);
    return svg`<svg viewBox="0 0 ${width} ${chartHeight +
        extra}" class="bar-chart">
    ${data.map((d, i) => {
        const barW = barLength(d, maxValue);
        return svg`<rect
                    width="${barW}"
                    height="${w}"
                    x="0"
                    y="${i * (w + gap)}"
                    style="fill: ${colors[i]}"
                ><title>District ${
                    parts[i].displayNumber
                } Deviation: ${roundToDecimal(deviations[i] * 100, 2)}%</title>
            </rect>`;
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
        let barW = barLength(d, maxValue),
              textX = barW + 2 * gap;
        return Math.round(d) > 0
            ? svg`
    <text
        style="font-size: ${textHeight}px;${(textX <= 240) || ('font-weight:bold;')}"
        x="${(textX > 240) ? 300 : textX}"
        text-anchor="${(textX > 240) ? 'end' : 'start'}"
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
