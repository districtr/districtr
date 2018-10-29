import { html, render, svg } from "lit-html";

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

const barChart = (data, maxValue, idealValue, tooltip) => {
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
        @mousemove=${e => tooltip.onMouseMove(e, i)}
        @mouseleave=${e => tooltip.onMouseLeave(e, i)}
        @mouseenter=${e => tooltip.onMouseEnter(e, i)}
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

        this.tooltip = new Tooltip(i => html`<h4>${i}</h4>`);
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
            html`
            ${barChart(
                this.data,
                maxValueOrLargestDatum,
                this.ideal,
                this.tooltip
            )}
            <div id="tooltip"></div>
            `,
            document.getElementById("tally")
        );
    }
}

class Tooltip {
    constructor(template, target) {
        this.template = template;
        this.target = document.getElementById("tooltip");
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
    onMouseLeave(e, state) {
        this.state = state;
        this.render();
    }
    onMouseEnter(e, state) {
        this.state = state;
        this.render(e.pageX, e.pageY);
    }
    onMouseMove(e, state) {
        this.state = state;
        this.render(e.pageX, e.pageY);
    }
    render(x, y) {
        const style =
            x && y ? `transform: translate(${x}, ${y})` : "display: none";
        render(
            html`
        <div class="tooltip-container" style=${style}>
        ${this.template(this.state)}
        </div>`,
            this.target
        );
    }
}
