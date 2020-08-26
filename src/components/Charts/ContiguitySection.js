import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(allParts, contiguityProblems, uiState, dispatch) {
  return html`
    <section class="toolbar-section">
      <h4 id="contiguity-status">
        ${Object.keys(contiguityProblems).length
          ? "Districts may have contiguity gaps"
          : "Any districts are contiguous"}
      </h4>
      <div class="district-row">
        ${allParts.map((part, dnum) => {
          return html`
            <div>
              <span
                id="contiguity-${dnum}"
                class="part-number"
                style="background:${districtColors[dnum].hex};
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
