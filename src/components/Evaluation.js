import { html } from "lit-html";
import { actions } from "../reducers/charts";
import ElectionResultsSection from "./Charts/ElectionResultsSection";
import RacialBalanceTable from "./Charts/RacialBalanceTable";
import RevealSection from "./RevealSection";

export default ({ parts, population, elections }, uiState, dispatch) => {
    const activeParts = parts.filter(part => part.visible);
    return html`
        ${population.subgroups.length > 1
            ? RevealSection(
                  "Racial Balance",
                  RacialBalanceTable(
                      population,
                      activeParts,
                      uiState,
                      dispatch
                  ),
                  uiState.charts.racialBalance.isOpen,
                  () => dispatch(actions.toggleOpen({ chart: "racialBalance" }))
              )
            : ""}
        ${elections.length > 0
            ? RevealSection(
                  "Partisan Balance",
                  ElectionResultsSection(
                      elections,
                      activeParts,
                      uiState,
                      dispatch
                  ),
                  uiState.charts.electionResults.isOpen,
                  () =>
                      dispatch(actions.toggleOpen({ chart: "electionResults" }))
              )
            : ""}
    `;
};
