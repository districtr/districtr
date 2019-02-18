import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import RevealSection from "../RevealSection";
import HighlightUnassigned from "./HighlightUnassigned";
import MultiMemberPopBalanceChart from "./MMPopBalanceChart";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default (
    { parts, problem, population, unitsBorders },
    uiState,
    dispatch
) => html`
    <section class="toolbar-section" id="charts">
        ${RevealSection(
            "Population Balance",
            html`
                ${problem.type === "multimember"
                    ? MultiMemberPopBalanceChart(population, parts)
                    : populationBarChart(population, parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(population)}
                    ${problem.type === "multimember"
                        ? ""
                        : populationDeviation(population)}
                    ${HighlightUnassigned(unitsBorders)}
                </dl>
            `,
            uiState.charts.population.isOpen,
            () => dispatch(actions.toggleOpen({ chart: "population" }))
        )}
    </section>
`;
