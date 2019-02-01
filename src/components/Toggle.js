import { html } from "lit-html";

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

export default toggle;
