import { html } from "lit-html";
import { actions } from "../reducers/elections";
import ElectionResults from "./Charts/ElectionResults";
import select from "./select";

export default function ElectionResultsSection(
    elections,
    parts,
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${select("elections", elections, index =>
                dispatch(actions.changeElection({ index }))
            )}
            ${ElectionResults(
                elections[uiState.elections.activeElectionIndex],
                parts
            )}
        </section>
    `;
}
