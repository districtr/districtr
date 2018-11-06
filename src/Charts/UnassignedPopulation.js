import { html } from "lit-html";
import { sum } from "../utils";
import { numberWithCommas } from "./utils";

export default population => {
    const totalAssignedPop = sum(population.tally.data);
    const unassignedPop = population.total - totalAssignedPop;
    return html`
    <dt>Unassigned population</dt>
    <dd>${numberWithCommas(unassignedPop)}</dd>
    `;
};
