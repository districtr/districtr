import { html } from "lit-html";
import HighlightUnassigned from "../HighlightUnassigned";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default ({ parts, population, unitsBorders }) => html`
    <section class="toolbar-section" id="charts">
        ${populationBarChart(population, parts)}
        <dl class="report-data-list">
            ${unassignedPopulation(population)}
            ${populationDeviation(population)}
            ${HighlightUnassigned(unitsBorders)}
        </dl>
    </section>
`;
