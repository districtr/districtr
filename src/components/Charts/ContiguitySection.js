import { html } from "lit-html";
import { actions } from "../../reducers/charts";

export default function ContiguitySection(
    contiguity,
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${JSON.stringify(contiguity).split(",").join(", ")}
        </section>
    `;
}
