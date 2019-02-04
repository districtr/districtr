import { html } from "lit-html";
import { actions } from "../reducers/charts";
import ElectionResultsSection from "./Charts/ElectionResultsSection";
import RacialBalanceTable from "./Charts/RacialBalanceTable";
import RevealSection from "./RevealSection";

export default ({ parts, population, elections }, uiState, dispatch) => html`
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
              "Partisan Balance",
              ElectionResultsSection(elections, parts, uiState, dispatch),
              uiState.charts.electionResults.isOpen,
              () => dispatch(actions.toggleOpen({ chart: "electionResults" }))
          )
        : ""}
`;
