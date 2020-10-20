import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(allParts, contiguityProblems, uiState, dispatch) {
  return html`
    <section class="toolbar-section">
      <h4 id="contiguity-status">
        ${Object.keys(contiguityProblems).length
          ? html`Districts may have contiguity gaps <small>click a number for more information</small>`
          : "No contiguity gaps detected"}
      </h4>
      <div class="district-row">
        ${allParts.map((part, dnum) => {
          return html`
            <div
              id="contiguity-${dnum}"
              class="contiguity-label"
              style="cursor:pointer;display:${Object.keys(contiguityProblems).includes(dnum)
                ? "flex"
                : "none"};"
            >
              <span
                class="part-number"
                style="background:${districtColors[dnum % districtColors.length].hex}"
              >
                ${Number(dnum) + 1}
              </span>
              &nbsp;- click to highlight
            </div>`;
        })}
      </div>
    </section>
  `;
}
