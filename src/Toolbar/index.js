import { html, render } from "lit-html";
import BrushColorPicker from "./BrushColorPicker";
import BrushSlider from "./BrushSlider";
import ToolSelector from "./ToolSelector";

const template = (toolSelector, brushSlider, colorPicker) => html`
${toolSelector}
${brushSlider}
${colorPicker}
<section>
<h3>Population</h3>
<ul id="population-values">
</ul>
</section>
`;

export default class Toolbar {
    constructor(tools, colors, brush) {
        this.render = this.render.bind(this);

        this.toolSelector = new ToolSelector(tools, this.render);
        this.colorPicker = new BrushColorPicker(brush, colors, this.render);
        this.brushSlider = new BrushSlider(brush, this.render);
    }
    render() {
        render(this.view(), document.getElementById("toolbar"));
    }
    view() {
        return template(
            this.toolSelector.view(),
            this.brushSlider.view(),
            this.colorPicker.view()
        );
    }
}
