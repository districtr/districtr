import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import { districtColors } from "../../colors";

export default function ContiguitySection(
    contiguities,
    uiState,
    dispatch
) {
    let foundDiscontiguity = false;
    Object.keys(contiguities).forEach((d) => {
        if (!contiguities[d]) {
            foundDiscontiguity = true;
        }
    });
    return html`
        <section class="toolbar-section">
            <h4 id="contiguity-status">
                ${foundDiscontiguity
                    ? "Districts may have contiguity gaps"
                    : "Any districts are contiguous"
                }
            </h4>
            <div class="district-row">
                ${Object.keys(contiguities).map((dnum) => {
                    return html`
                        <span
                            id="contiguity-${dnum}"
                            class="part-number"
                            style="background:${districtColors[dnum].hex};
                                  display:${contiguities[dnum] ? "none" : "flex"};"
                        >
                            ${Number(dnum) + 1}
                        </span>
                    `;
                })}
            </div>
        </section>
    `;
}
