import { html } from "lit-html";

function addNewColorButton(colors, onInput) {
    const nextColor = colors.find(color => color.visible === false);
    const onClick = e => {
        nextColor.visible = true;
        onInput(e);
    };
    if (!nextColor) {
        return "";
    }
    return html`
        <button
            class="icon-list__item subtle-button"
            value="${nextColor.id}"
            @click=${onClick}
            title="Add another color"
        >
            <i class="material-icons">
                add
            </i>
        </button>
    `;
}

export default (colors, onInput, activeColor) => html`
    <legend>Color</legend>
    <div class="icon-list color-list">
        ${colors
            .filter(color => color.visible)
            .map(
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
        ${addNewColorButton(colors, onInput)}
    </div>
`;
