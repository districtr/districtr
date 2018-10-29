import { html } from "lit-html";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";

export default class EraserTool extends Tool {
    constructor(brush) {
        const icon = html`<i style="font-size: 1.4em" class="fas fa-eraser"></i>`;
        super("eraser", "Eraser", icon);
        this.brush = brush;
        this.options = new EraserToolOptions(brush);
    }
    activate() {
        super.activate();
        this.brush.activate();
        this.brush.startErasing();
    }
    deactivate() {
        super.deactivate();
        this.brush.deactivate();
        this.brush.stopErasing();
    }
}

class EraserToolOptions {
    constructor(brush, renderToolbar) {
        this.brush = brush;
        this.renderToolbar = renderToolbar;
        this.changeRadius = this.changeRadius.bind(this);
    }
    changeRadius(e) {
        e.stopPropagation();
        let value = parseInt(e.target.value);
        if (this.brush.radius != value) {
            this.brush.radius = value;
        }
        this.renderToolbar();
    }
    render() {
        return html`
        ${BrushSlider(this.brush.radius, this.changeRadius, {
            title: "Eraser Size"
        })}
        `;
    }
}
