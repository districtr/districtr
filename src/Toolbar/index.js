import { html, render } from "lit-html";
import BrushColorPicker from "./BrushColorPicker";
import BrushSlider from "./BrushSlider";
import ToolSelector from "./ToolSelector";

const template = (toolSelector, brushSlider, colorPicker, brushActive) => html`
${toolSelector}
<section>
${brushSlider}
${colorPicker}
</section>
<section>
<legend>Population</legend>
<div id="tally" style="background: #eee"></div>
</section>
`;

export default class Toolbar {
    constructor(tools, colors, brush) {
        this.render = this.render.bind(this);

        this.toolSelector = new ToolSelector(tools, this.render);
        this.colorPicker = new BrushColorPicker(
            brush,
            colors,
            this.render,
            this.toolSelector
        );
        this.brushSlider = new BrushSlider(brush, this.render);
    }
    render() {
        render(this.view(), document.getElementById("toolbar"));
    }
    view() {
        return template(
            this.toolSelector.view(),
            this.brushSlider.view(),
            this.colorPicker.view(),
            this.toolSelector.activeTool === "brush"
        );
    }
}
