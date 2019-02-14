import { html } from "lit-html";
import { numberWithCommas, sum } from "../../utils";

export default population => {
    const totalAssignedPop = sum(population.total.tally.data);
    const unassignedPop = Math.round(population.total.sum - totalAssignedPop);
    return html`
        <dt>Unassigned population</dt>
        <dd>${numberWithCommas(unassignedPop)}</dd>
    `;
};
