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
            <div>
              <span
                id="contiguity-${dnum}"
                class="part-number"
                style="cursor:pointer;background:${districtColors[dnum % districtColors.length].hex};
                                  display:${Object.keys(contiguityProblems).includes(dnum)
                  ? "flex"
                  : "none"};"
              >
                ${Number(dnum) + 1}
              </span>
            </div>
          `;
        })}
      </div>
    </section>
  `;
}
