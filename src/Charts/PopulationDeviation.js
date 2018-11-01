import { html } from "lit-html";
import { roundToDecimal } from "./utils";

export default population => {
    const maxPopDev = Math.max(...population.deviations());
    return html`
        <dt>Max. Population Deviation</dt>
        <dd>
        ${roundToDecimal(maxPopDev * 100, 2)}%
        </dd>
        `;
};
