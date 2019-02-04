import { html } from "lit-html";
import {
    highlightUnassignedUnitBordersPaintProperty,
    unitBordersPaintProperty
} from "../../colors";

export function toggle(label, checked, onChange) {
    return html`
        <label class="toolbar-checkbox">
            <input
                type="checkbox"
                ?checked="${checked}"
                @change="${e => onChange(e.target.checked)}"
            />
            ${label}
        </label>
    `;
}

export default function HighlightUnassigned(unitsBorders) {
    return toggle("Highlight unassigned units", false, highlight => {
        if (highlight) {
            unitsBorders.setPaintProperties(
                highlightUnassignedUnitBordersPaintProperty
            );
        } else {
            unitsBorders.setPaintProperties(unitBordersPaintProperty);
        }
    });
}
