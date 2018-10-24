import { html } from "lit-html";

const brushSliderTemplate = (radius, onChange) => html`<section>
<fieldset>
<legend>Brush Size</legend>
<div>
  <input class="slider" type="range" value="${radius}" min="1" max="100" @change=${onChange}>
</div>
<div>
  <input class="slider-value" type="number" value="${radius}" min="1" max="100" @change=${onChange}>
</div>
</fieldset>
</section>`;

export default class BrushSlider {
    constructor(brush, render) {
        this.brush = brush;
        this.onChangeRadius = this.onChangeRadius.bind(this);
        this.render = render;
    }
    onChangeRadius(e) {
        e.stopPropagation();
        let value = parseInt(e.target.value);
        if (this.brush.radius != value) {
            this.brush.radius = value;
            this.render();
        }
    }
    view() {
        return brushSliderTemplate(this.brush.radius, this.onChangeRadius);
    }
}
