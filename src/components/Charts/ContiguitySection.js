import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(allParts, contiguityProblems, contigVersion, state, uiState, dispatch) {
  if (!contiguityProblems) {
    contiguityProblems = {};
  }
  const showWarning = ['wisconsin', 'ohio'].includes(state);
  return html`
    <section class="toolbar-section">
      ${showWarning ? html`<p class="italic-note">This tool checks if districts are contiguous.
        Note that the units themselves may be disconnected into several tiny pieces,
        so districts may be technically contiguous (in terms of the
        network of units) though their appearance is disconnected.</p>` : ""}
      <h4 id="contiguity-status">
        ${Object.keys(contiguityProblems).filter(k => contiguityProblems[k] && contiguityProblems[k].length > 1).length
          ? html`Districts may have contiguity gaps (${Object.keys(contiguityProblems).filter(k => contiguityProblems[k] && contiguityProblems[k].length > 1).map(n => (n * 1) + 1).join(", ")})`
          : "No contiguity gaps detected"}
      </h4>
      <div class="district-row" style="display:${contigVersion === 2 ? "block" : "flex"}">
        ${allParts.map((part, dnum) => {
          return html`
            <div
              id="contiguity-${dnum}"
              class="contiguity-label"
              style="display:${Object.keys(contiguityProblems).includes(dnum)
                ? "flex"
                : "none"};"
            >
              <span
                class="part-number"
                style="background:${districtColors[dnum % districtColors.length].hex}"
              >
                ${Number(dnum) + 1}
              </span>
              ${contigVersion >= 2 ? html`<label>
                <input type="checkbox"/>
                Highlight islands
              </label>` : ""}
            </div>`;
        })}
      </div>
    </section>
  `;
}
