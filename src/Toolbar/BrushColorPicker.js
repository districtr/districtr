import { html } from "lit-html";

const colorPickerTemplate = (colors, onInput) => html`
<fieldset>
<legend>Brush Color</legend>
${colors.map(
    color => html`
    <div>
    <input type="radio" id="brush-color__${
        color.id
    }" name="brush-color" value="${color.id}"
    ?checked=${color.checked}
    @input=${onInput}>
    <label for="brush-color-${color.id}">${color.name}</label>
    </div>`
)}
</fieldset>`;

export default class BrushColorPicker {
    constructor(brush, colors, render) {
        this.brush = brush;
        this.colors = colors;
        this.render = render;

        this.selectColor = this.selectColor.bind(this);
    }
    selectColor(e) {
        this.brush.setColor(e.target.value);
        this.render();
    }
    view() {
        return colorPickerTemplate(this.colors, this.selectColor);
    }
}
