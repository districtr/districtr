import { html } from "lit-html";
import { numberWithCommas, sum } from "../../utils";

import spanish from "../../l10n/es";
const i18n = spanish.spanish;

export default population => {
    const totalAssignedPop = sum(population.total.data);
    const unassignedPop = Math.round(population.total.sum - totalAssignedPop);
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label ui-label--row">${i18n.editor.population.unassigned}:</dt>
            <dd class="ui-data">${numberWithCommas(unassignedPop)}</dd>
        </div>
    `;
};
