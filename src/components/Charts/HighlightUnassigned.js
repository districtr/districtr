import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import toggle from "../Toggle";

export default function HighlightUnassigned(unitsBorders) {
    return html`
        <div class="ui-option ui-option--slim">
            ${toggle("Highlight unassigned units", false, highlight => {
                if (highlight) {
                    unitsBorders.setPaintProperties(
                        highlightUnassignedUnitBordersPaintProperty
                    );
                } else {
                    unitsBorders.setPaintProperties(unitBordersPaintProperty);
                }
            })}
        </div>
    `;
}
