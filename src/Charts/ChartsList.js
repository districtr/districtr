import { html } from "lit-html";
import electionResults from "./ElectionResults";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default state => html`
    <section id="charts">
        ${populationBarChart(state.population, state.parts)}
        <dl class="report-data-list">
        ${unassignedPopulation(state.population)}
        ${populationDeviation(state.population)}
        </dl>
    </section>
    <section id="elections" style="display: none">
        ${state.elections.map(election =>
            electionResults(election, state.parts)
        )}
    </section>
    `;
