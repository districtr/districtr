import { html, render, svg } from "lit-html";

const template = data => html`
<ul>
${data.map(d => html`<li>${d}</li>`)}
</ul>`;

const width = 200;
const height = 200;
const gap = 5;

function barWidth(data) {
    return (width - (gap * data.length - 1)) / data.length;
}

function barHeight(d, maxValue) {
    if (d === 0 || maxValue == 0) {
        return 0;
    }
    return height * (d / maxValue);
}

const barChart = (data, maxValue) => {
    const w = barWidth(data);
    return svg`
    <svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    ${data.map((d, i) => {
        const barH = barHeight(d, maxValue);
        return svg`
    <rect width=${w} height=${barH} x="${i * (w + gap)}" y="${height -
            barH}"></rect>
    `;
    })}
    </svg>
    `;
};

export default class Tally {
    constructor(initialData, attributeKey) {
        this.data = initialData;
        this.attributeKey = attributeKey;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(feature, color) {
        this.data[color] += feature.properties[this.attributeKey];
        this.data[feature.state.color] -= feature.properties[this.attributeKey];
    }

    render() {
        render(
            barChart(this.data, Math.max(...this.data)),
            document.getElementById("tally")
        );
    }
}
