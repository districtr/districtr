import { html } from "lit-html";
import { actions } from "../../reducers/elections";
import Select from "../Select";
import ElectionResults from "./ElectionResults";

export default function ElectionResultsSection(
    elections,
    parts,
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${Select(elections, index =>
                dispatch(actions.changeElection({ index }))
            , uiState.elections.activeElectionIndex)}
            ${ElectionResults(
                elections[uiState.elections.activeElectionIndex],
                parts
            )}
        </section>
    `;
}
