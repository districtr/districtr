import { html } from "lit-html";

/**
 * @description Easy creation of checkbox toggles.
 * @param {String} label Text label adjoining the checkbox.
 * @param {Boolean} checked Is this checkbox checked by default?
 * @param {Function} onChange Function describing what happens when the box is checked/unchecked.
 * @param {String} optionalId Optional unique HTML identifier given to the HTML entity.
 * @returns {HTMLTemplateElement} Renderable lit-html template element.
 */
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
