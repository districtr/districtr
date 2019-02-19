import { html, svg } from "lit-html";
import { roundToDecimal } from "../../utils";

const defaultHeight = 240;
const width = 300;

const maxBarLength = width / 2;
const gap = 2;
const r = 12;
const seatsListWidth = 48;

function barHeight(data, chartHeight) {
    return (chartHeight - (gap * data.length - 1)) / data.length;
}

function pctDeviationFromIntegerMultiple(d, ideal) {
    const over = d % ideal / ideal;
    if (over > 0.5) {
        return over - 1;
    } else {
        return over;
    }
}

function barLength(deviation) {
    return Math.abs(deviation) * maxBarLength;
}

function barPosition(deviation) {
    if (deviation > 0) {
        return width / 2;
    } else {
        return width / 2 - barLength(deviation);
    }
}

function labelPosition(deviation) {
    if (deviation > 0) {
        return barPosition(deviation) + barLength(deviation) + gap;
    } else {
        return barPosition(deviation) - gap;
    }
}

function numberOfSeats(d, ideal) {
    return Math.round(d / ideal);
}

const extra = 20;

const OverUnderChart = (population, parts) => {
    const data = population.total.tally.data.filter(x => Math.round(x) > 0);
    const chartHeight = Math.max(defaultHeight, 24 * data.length);
    const colors = parts
        .filter(
            (part, i) =>
                part.visible && Math.round(population.total.tally.data[i]) > 0
        )
        .map(part => part.color);

    const w = barHeight(data, chartHeight);
    const textHeight = Math.min(w + gap, 16);
    const idealY = width / 2;
    return svg`<svg viewBox="0 0 ${width} ${chartHeight +
        extra}" width="${width}" height="${chartHeight +
        extra}" class="bar-chart">
        <g style="transform: translateX(${seatsListWidth / 2}px)">
    ${data.map((d, i) => {
        const deviation = pctDeviationFromIntegerMultiple(d, population.ideal);
        const labelX = labelPosition(deviation);

        const barL = barLength(deviation);
        const barX = barPosition(deviation);
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
    })}
    
    <line
        x1="${width - idealY}"
        y1="${0}"
        x2="${width - idealY}"
        y2="${chartHeight + extra}"
        stroke="#aaa" />
    <text
        x="${width / 2 - 6}"
        y="${chartHeight + extra - 4}"
        text-anchor="end" 
        fill="#111">
        Under
    </text>
    <text x="${width / 2 + 6}"
        y="${chartHeight + extra - 4}"
        text-anchor="start"
        fill="#111">
        Over
    </text>
    </g>
    <rect
        x="0"
        y="0"
        width="${seatsListWidth}"
        height = "${chartHeight + extra}" class="bar-chart-overlay"></rect>
        
    ${data.map((d, i) => {
        const seats = numberOfSeats(d, population.ideal);
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
    })}
    </svg>
    `;
};

const MultiMemberPopBalanceChart = (population, parts) => html`
    <section class="toolbar-section">
        <div class="pop-balance-chart__header">
            <span style="width: ${seatsListWidth}px">Seats</span>
            <span style="flex: 1">Deviation</span>
        </div>
        ${OverUnderChart(population, parts)}
    </section>
`;

export default MultiMemberPopBalanceChart;
