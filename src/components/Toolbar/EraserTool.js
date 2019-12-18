import { html } from "lit-html";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";

export default class EraserTool extends Tool {
    constructor(brush) {
        const icon = html`
            <i class="fas fa-eraser"></i>
        `;
        super("eraser", "Erase", icon);
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
        let undo = this.brush.undo,
            redo = this.brush.redo;
        return html`
            ${BrushSlider(this.brush.radius, this.changeRadius, {
                title: "Eraser Size"
            })}
            <button
                class="button button--alternate"
                @click="${redo}"
                style="float:right;margin-bottom:8px;"
            >
                Redo
            </button>
            <button
                class="button button--alternate"
                @click="${undo}"
                style="float:right;margin-bottom:8px;"
            >
                Undo
            </button>
        `;
    }
}
