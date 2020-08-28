import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(contiguities, uiState, dispatch) {
  return html`
    <section class="toolbar-section">
      <span id="contiguity-status">
      </span>
    </section>
}
