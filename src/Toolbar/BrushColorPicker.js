import { html } from "lit-html";

const colorPickerTemplate = (colors, onInput, activeColor) => html`
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

export default class BrushColorPicker {
    constructor(brush, colors, render, toolSelector) {
        this.brush = brush;
        this.colors = colors;
        this.render = render;
        this.toolSelector = toolSelector;

        this.selectColor = this.selectColor.bind(this);
    }
    selectColor(e) {
        this.toolSelector.selectTool("brush");
        this.brush.setColor(e.target.value);
    }
    view() {
        return colorPickerTemplate(
            this.colors,
            this.selectColor,
            this.colors[this.brush.color].id
        );
    }
}
