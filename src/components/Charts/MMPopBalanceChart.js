import { html, svg } from "lit-html";
import { roundToDecimal } from "../../utils";
import {
    barHeight,
    barLength,
    barPosition,
    getColorsToDisplay,
    labelPosition,
    numberOfSeats,
    pctDeviationFromIntegerMultiple
} from "./lib";

const defaultHeight = 240;
const width = 300;

const maxBarLength = width / 2;
const gap = 2;
const r = 12;
const seatsListWidth = 48;

const extra = 20;

const OverUnderBars = (data, colors, ideal, textHeight, w) =>
    data.map((d, i) => {
        const deviation = pctDeviationFromIntegerMultiple(d, ideal);
        const labelX = labelPosition(deviation, gap, width);

        const barL = barLength(deviation, maxBarLength);
        const barX = barPosition(deviation, width);
        return svg`
    <rect
        width="${barL}"
        height="${w}"
        x="${barX}"
        y="${i * (w + gap)}"
        style="fill: ${colors[i]}"
    ></rect>
    <text
        style="font-size: ${textHeight}px"
        text-anchor=${deviation > 0 ? "start" : "end"}
        x="${labelX}"
        y="${i * (w + gap) +
            w / 2 -
            gap / 2 +
            textHeight / 2}">${roundToDecimal(deviation * 100, 1)}%</text>`;
    });

const OverUnderAnnotations = (chartHeight, chartWidth) =>
    svg`<line
        x1="${chartWidth / 2}"
        y1="${0}"
        x2="${chartWidth / 2}"
        y2="${chartHeight + extra}"
        stroke="#aaa" />
        <text
        x="${chartWidth / 2 - 6}"
        y="${chartHeight + extra - 4}"
        text-anchor="end" 
        fill="#111">
        Under
        </text>
        <text x="${chartWidth / 2 + 6}"
        y="${chartHeight + extra - 4}"
        text-anchor="start"
        fill="#111">
        Over
        </text>`;

const SeatNumberLabels = (data, ideal, w, colors, textHeight, chartHeight) =>
    svg`
    <rect
        x="0"
        y="0"
        width="${seatsListWidth}"
        height = "${chartHeight + extra}" class="bar-chart-overlay"></rect>
    ${data.map((d, i) => {
        const seats = numberOfSeats(d, ideal);
        return svg`
        <circle
            cx="${seatsListWidth / 2}"
            cy="${i * (w + gap) + w / 2 + gap}"
            r="${r}"
            fill="${colors[i]}" />
        <text
            class="seats-list__item"
            text-anchor="middle"
            y="${i * (w + gap) + w / 2 - gap / 2 + textHeight / 2}"
            x="${seatsListWidth / 2}">
            ${seats}
        </text>`;
    })}`;

const OverUnderChart = (population, parts) => {
    const data = population.total.data.filter(x => Math.round(x) > 0);
    const chartHeight = Math.max(defaultHeight, 24 * data.length);
    const colors = getColorsToDisplay(parts, population.total.data);

    const w = barHeight(data, chartHeight, gap);
    const textHeight = Math.min(w + gap, 16);
    return svg`
    <svg viewBox="0 0 ${width} ${chartHeight +
        extra}" width="${width}" height="${chartHeight +
        extra}" class="bar-chart" style="align-self: center">
        <g style="transform: translateX(${seatsListWidth / 2}px)">
            ${OverUnderBars(data, colors, population.ideal, textHeight, w)}
            ${OverUnderAnnotations(chartHeight, width)}
        </g>
        ${SeatNumberLabels(
            data,
            population.ideal,
            w,
            colors,
            textHeight,
            chartHeight
        )}  
    </svg>
    `;
};

const MultiMemberPopBalanceChart = (population, parts) => html`
    <section class="toolbar-section">
        <div class="pop-balance-chart__header" style="align-self: center">
            <span style="width: ${seatsListWidth}px">Seats</span>
            <span style="flex: 1">Deviation</span>
        </div>
        ${OverUnderChart(population, parts)}
    </section>
`;

export default MultiMemberPopBalanceChart;
