import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import RevealSection from "../RevealSection";
import HighlightUnassigned from "./HighlightUnassigned";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default ({ parts, population, unitsBorders }, uiState, dispatch) => html`
    <section class="toolbar-section" id="charts">
        ${RevealSection(
            "Population Balance",
            html`
                ${populationBarChart(population, parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(population)}
                    ${populationDeviation(population)}
                    ${HighlightUnassigned(unitsBorders)}
                </dl>
            `,
            uiState.charts.population.isOpen,
            () => dispatch(actions.toggleOpen({ chart: "population" }))
        )}
    </section>
`;
