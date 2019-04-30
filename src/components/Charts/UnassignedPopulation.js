import { html } from "lit-html";
import { numberWithCommas, sum } from "../../utils";

export default population => {
    const totalAssignedPop = sum(population.total.data);
    const unassignedPop = Math.round(population.total.sum - totalAssignedPop);
    return html`
        <div class="ui-option ui-option--slim">
            <dt class="ui-label ui-label--row">Unassigned population:</dt>
            <dd class="ui-data">${numberWithCommas(unassignedPop)}</dd>
        </div>
    `;
};
