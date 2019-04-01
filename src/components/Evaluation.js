import { html } from "lit-html";
import { actions } from "../reducers/charts";
import ElectionResultsSection from "./Charts/ElectionResultsSection";
import RacialBalanceTable from "./Charts/RacialBalanceTable";
import RevealSection from "./RevealSection";

export default ({ parts, population, vap, elections }, uiState, dispatch) => {
    const activeParts = parts.filter(part => part.visible);
    return html`
        ${population.subgroups.length > 1
            ? RevealSection(
                  "Racial Balance",
                  RacialBalanceTable(
                      "racialBalance",
                      population,
                      activeParts,
                      uiState.charts.racialBalance,
                      dispatch
                  ),
                  uiState.charts.racialBalance.isOpen,
                  () => dispatch(actions.toggleOpen({ chart: "racialBalance" }))
              )
            : ""}
        ${vap
            ? RevealSection(
                  "VAP Balance",
                  RacialBalanceTable(
                      "vapBalance",
                      vap,
                      activeParts,
                      uiState.charts.vapBalance,
                      dispatch
                  ),
                  uiState.charts.vapBalance.isOpen,
                  () => dispatch(actions.toggleOpen({ chart: "vapBalance" }))
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
