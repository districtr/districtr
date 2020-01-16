import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";
import { html } from "lit-html";
import toggle from "../Toggle";

import spanish from "../../l10n/es";
const i18n = spanish.spanish;

export default function HighlightUnassigned(unitsBorders) {
    return html`
        <div class="ui-option ui-option--slim">
            ${toggle(i18n.editor.population.highlight_unassigned, false, highlight => {
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
