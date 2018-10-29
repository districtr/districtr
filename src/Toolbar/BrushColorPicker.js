import { html } from "lit-html";

export default (colors, onInput, activeColor) => html`
<fieldset class="icon-list color-list">
<legend>Color</legend>
${colors.map(
    color => html`
    <div class="icon-list__item">
    <input type="radio" id="brush-color__${
        color.id
    }" name="brush-color" value="${color.id}"
    ?checked=${color.id === activeColor}
    @input=${onInput}>
    <div class="icon-list__item__radio" style="background: ${color.name}"></div>
    </div>`
)}
</fieldset>`;
