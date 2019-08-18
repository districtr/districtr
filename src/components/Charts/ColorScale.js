import { html } from "lit-html";
import { asPercent, extent } from "../../utils";

export const ColorBar = (stops, length) => html`
    <div
        class="color-scale__bar"
        style="background: ${linearGradient(stops, length)}"
    ></div>
`;

export function linearGradient(stops, length) {
    return `linear-gradient(to left, ${stops.reduce(
        (commaSeparatedList, stop) =>
            `${commaSeparatedList}, ${stop.color} ${asPercent(stop, length)}`,
        ""
    )}`;
}

export const Labels = (stops, length) => html`
    <ol class="color-scale__labels">
        ${stops.map(
            stop => html`
                <li
                    class="color-scale__label"
                    style="position: absolute; left: ${asPercent(
                        stop.value,
                        length
                    )}"
                >
                    ${stop.value}
                </li>
            `
        )}
    </ol>
`;

export default function ColorScale(stops) {
    const length = extent(stops.map(stop => stop.value));
    return html`
        <div class="color-scale">
            ${ColorBar(stops, length)} ${Labels(stops, length)}
        </div>
    `;
}
