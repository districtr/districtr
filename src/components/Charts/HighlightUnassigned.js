import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import toggle from "../Toggle";

export default function HighlightUnassigned(unitsBorders, zoomFunction) {
    return html`
        <div id="unassigned-checker" class="ui-option ui-option--slim">
            ${toggle("Highlight unassigned units", false, highlight => {
                document.querySelectorAll('.district-row .contiguity-label input').forEach(box => {
                    box.checked = false;
                });
                if (highlight) {
                    unitsBorders.setPaintProperties(
                        highlightUnassignedUnitBordersPaintProperty
                    );
                } else {
                    unitsBorders.setPaintProperties(unitBordersPaintProperty);
                }
            })}
            ${zoomFunction
              ? html`<button @click="${zoomFunction}">Zoom to unasssigned</button>`
              : ''
            }
        </div>
    `;
}
