import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(
    contiguity,
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            <h4>Districts with contiguity gaps</h4>
            <div class="district-row">
                ${Object.keys(contiguity).map((dnum) => {
                    return html`
                        <span
                            id="contiguity-${dnum}"
                            class="part-number"
                            style="background:${districtColors[dnum].hex};
                                  display:${contiguity[dnum] ? "none" : "flex"};"
                        >
                            ${Number(dnum) + 1}
                        </span>
                    `;
                })}
            </div>
        </section>
    `;
}
