import { html } from "lit-html";
import { numberWithCommas } from "./utils";

export default population => {
    const totalAssignedPop = population.tally.data.reduce(
        (sum, pop) => sum + pop,
        0
    );
    const unassignedPop = population.total - totalAssignedPop;
    return html`
    <dt>Unassigned population</dt>
    <dd>${numberWithCommas(unassignedPop)}</dd>
    `;
};
