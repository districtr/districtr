import { html } from "lit-html";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default ({ parts, population }) => html`
    <section class="toolbar-section" id="charts">
        ${populationBarChart(population, parts)}
        <dl class="report-data-list">
            ${unassignedPopulation(population)}
            ${populationDeviation(population)}
        </dl>
    </section>
`;
