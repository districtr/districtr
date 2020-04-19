import { html } from "lit-html";

export default (radius, onChange, options) => html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">
            ${options ? options.title : "Brush Size"}
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
