import { html } from "lit-html";

import spanish from "../../l10n/es";
const i18n = spanish.spanish;

export default (radius, onChange, options) => html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">
            ${options ? i18n.editor.tools[options.title] : i18n.editor.tools.brush_size}
        </legend>
        <div class="slider-container">
            <input
                class="slider"
                type="range"
                value="${radius}"
                min="1"
                max="100"
                @change=${onChange}
            />
            <input
                class="slider-value"
                type="number"
                value="${radius}"
                min="1"
                max="100"
                @change=${onChange}
            />
        </div>
    </div>
`;
