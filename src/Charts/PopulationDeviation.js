import { html } from "lit-html";
import { roundToDecimal } from "./utils";

export default class PopulationDeviation {
    constructor(populationChart) {
        this.population = populationChart;
    }
    update() {
        return null;
    }
    render() {
        const populationDeviations = this.population.tally.data.map(
            d => Math.abs(d - this.population.ideal) / this.population.ideal
        );
        const maxPopDev = Math.max(...populationDeviations);
        return html`
        <dt>Max. Population Deviation</dt>
        <dd>
        ${roundToDecimal(maxPopDev * 100, 2)}%
        </dd>
        `;
    }
}
