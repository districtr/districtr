import { html } from "lit-html";
import { roundToDecimal } from "../../utils";

export default population => {
    const maxPopDev = Math.max(...population.deviations());
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label">Max. population deviation:</dt>
            <dd class="ui-data">${roundToDecimal(maxPopDev * 100, 2)}%</dd>
        </div>
    `;
};
