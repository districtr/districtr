import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import ElectionResultsSection from "../ElectionResultsSection";
import HighlightUnassigned from "../HighlightUnassigned";
import RacialBalanceTable from "../RacialBalanceTable";
import RevealSection from "../RevealSection";
import populationBarChart from "./PopulationBarChart";
import populationDeviation from "./PopulationDeviation";
import unassignedPopulation from "./UnassignedPopulation";

export default (
    { parts, population, elections, unitsBorders },
    uiState,
    dispatch
) => html`
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
        ${population.subgroups.length > 0
            ? RevealSection(
                  "Racial Balance",
                  RacialBalanceTable(population, parts, uiState, dispatch),
                  uiState.charts.racialBalance.isOpen,
                  () => dispatch(actions.toggleOpen({ chart: "racialBalance" }))
              )
            : ""}
        ${elections.length > 0
            ? RevealSection(
                  "Election Results",
                  ElectionResultsSection(elections, parts, uiState, dispatch),
                  uiState.charts.electionResults.isOpen,
                  () =>
                      dispatch(actions.toggleOpen({ chart: "electionResults" }))
              )
            : ""}
    </section>
`;
