import { svg } from "lit-html";

export default (data, maxValue, idealValue) => {
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
                  4}" fill="#111">Ideal</text>`
            : ""
    }
    </svg>
    `;
};
