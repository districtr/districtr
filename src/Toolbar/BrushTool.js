import { html } from "lit-html";
import BrushColorPicker from "./BrushColorPicker";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";

export default class BrushTool extends Tool {
    constructor(brush, colors) {
        super("brush", "Brush", "brush");
        this._icon = "brush";
        this.brush = brush;
        this.colors = colors;
        this.options = new BrushToolOptions(brush, colors);
    }
    activate() {
        super.activate();
        this.brush.activate();
    }
    deactivate() {
        super.deactivate();
        this.brush.deactivate();
    }
    render(selectTool) {
        if (this.active && this.brush.color !== undefined) {
            this.icon = html`<span style="color: ${
                this.colors[this.brush.color].name
            }">${this._icon}</span>`;
        } else {
            this.icon = this._icon;
        }
        return super.render(selectTool);
    }
}

class BrushToolOptions {
    constructor(brush, colors, renderToolbar) {
        this.brush = brush;
        this.colors = colors;
        this.renderToolbar = this.renderToolbar;
        this.selectColor = this.selectColor.bind(this);
        this.changeRadius = this.changeRadius.bind(this);
    }
    selectColor(e) {
        this.brush.setColor(e.target.value);
        this.renderToolbar();
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
        const activeColor = this.colors[this.brush.color].id;
        return html`
        ${BrushColorPicker(this.colors, this.selectColor, activeColor)}
        ${BrushSlider(this.brush.radius, this.changeRadius)}
        `;
    }
}
