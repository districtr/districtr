import { html } from "lit-html";

export default (colors, onInput, activeColor) => html`
    <legend>Color</legend>
    <div class="icon-list color-list">
        ${colors.map(
            color => html`
                <div class="icon-list__item color-list__item">
                    <input
                        type="radio"
                        id="brush-color__${color.id}"
                        name="brush-color"
                        value="${color.id}"
                        ?checked="${color.id === activeColor}"
                        @change="${onInput}"
                    />
                    <div
                        class="icon-list__item__radio"
                        style="background: ${color.color}"
                    ></div>
                </div>
            `
        )}
    </div>
`;
