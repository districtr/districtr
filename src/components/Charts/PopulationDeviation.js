import { html } from "lit-html";
import { roundToDecimal } from "../../utils";

import spanish from "../../l10n/es";
const i18n = spanish.spanish;

export default population => {
    let deviations = population
        .deviations()
        // .filter(d => d != -1) // leave out empty districts
        .map(d => Math.abs(d));
    if (deviations.length == 0) {
        deviations.push(1);
    }
    const maxPopDev = Math.max(...deviations);
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label">${i18n.editor.population.max_deviation}:</dt>
            <dd class="ui-data">${roundToDecimal(maxPopDev * 100, 2)}%</dd>
        </div>
    `;
};
