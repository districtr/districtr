import { html } from "lit-html";

export function toggle(label, checked, onChange, optionalId) {
    return html`
        <label class="toolbar-checkbox">
            <input
                id="${optionalId || null}"
                type="checkbox"
                ?checked="${checked}"
                @change="${e => onChange(e.target.checked)}"
            />
            ${label}
        </label>
    `;
}

export default toggle;
