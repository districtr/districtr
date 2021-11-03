import { html } from "lit-html";
import hotkeys from 'hotkeys-js';

import BrushColorPicker from "./BrushColorPicker";
import BrushSlider from "./BrushSlider";
import UndoRedo from "./UndoRedo";
import Tool from "./Tool";

const icon = (active, colorId, colors) => {
    return html`<img src="/assets/eyedropper.svg" alt="Brush"/>`
};

export default class EyedropperTool extends Tool {
    constructor(eyedropper, brush, colors) {
        super("eyedrop", "Color Picker", icon);
        this.eyedropper = eyedropper;
        this.brush = brush;
        this.colors = colors;
        this.options = new EyedropperToolOptions();

    }
    activate() {
        super.activate();
        this.eyedropper.activate();
    }
    deactivate() {
        super.deactivate();
        this.eyedropper.deactivate();
    }
    render(selectTool) {
        this.icon = icon(this.active, this.brush.color, this.colors);
        return super.render(selectTool);
    }
}

class EyedropperToolOptions {
    constructor() {
    }
    render() {
        return html`click a colored unit to activate that color.`;
    }
}