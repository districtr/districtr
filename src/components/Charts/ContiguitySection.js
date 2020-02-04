import { html } from "lit-html";

export default function ContiguitySection(
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${JSON.stringify(window.d_contiguity)}
        </section>
    `;
}
