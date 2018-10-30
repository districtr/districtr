import { html } from "lit-html";
import { getPopulation } from "../context";
import { numberWithCommas } from "./utils";

export default class UnassignedPopulation {
    constructor(totalPopulation, partPopulations) {
        this.unassignedPop = totalPopulation;
        if (partPopulations !== undefined) {
            for (let pop of this.unassignedPop) {
                this.unassignedPop -= pop;
            }
        }
    }
    update(feature, color) {
        const wasUnassigned =
            feature.state.color === null || feature.state.color === undefined;
        const isNowUnassigned = color === null || color === undefined;
        if (wasUnassigned && !isNowUnassigned) {
            this.unassignedPop -= getPopulation(feature);
        } else if (!wasUnassigned && isNowUnassigned) {
            this.unassignedPop += getPopulation(feature);
        }
    }
    render() {
        return html`
        <dt>Unassigned population</dt>
        <dd>${numberWithCommas(this.unassignedPop)}</dd>
        `;
    }
}
