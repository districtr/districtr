import { html, svg } from "lit-html";
import { numberWithCommas } from "../../utils";

const width = 240;
const height = 300;
const gap = 2;

function barWidth(data) {
    return (width - (gap * data.length - 1)) / data.length;
}

function barHeight(d, maxValue) {
    if (d === 0 || maxValue === 0) {
        return 0;
    }
    return height * (d / maxValue);
}

const extra = 20;

const horizontalBarChart = (population, parts) => {
    const data = population.total.tally.data;
    const maxValue = population.maxDisplayValue();
    const colors = parts.map(part => part.color);
    const formattedIdeal = population.formattedIdeal;

    const w = barWidth(data);
    const textHeight = Math.min(w + gap, 16);
    const idealY = height - barHeight(population.ideal, maxValue);
    return svg`<svg viewBox="0 0 ${height} ${width +
        extra}" width="${height}" height="${width + extra}" class="bar-chart">
    ${data.map((d, i) => {
        const barH = barHeight(d, maxValue);
        return svg`<rect
                    width="${barH}"
                    height="${w}"
                    x="0"
                    y="${i * (w + gap)}"
                    style="fill: ${colors[i]}"
                ></rect>`;
    })}
    ${
        population.ideal > 0
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
        return Math.round(d) > 0
            ? svg`
    <text
        style="font-size: ${textHeight}px"
        x="${barH + 2 * gap}"
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
