import { html } from "lit-html";
import hotkeys from 'hotkeys-js';

import BrushColorPicker from "./BrushColorPicker";
import BrushSlider from "./BrushSlider";
import UndoRedo from "./UndoRedo";
import Tool from "./Tool";

const icon = (active, colorId, colors) => {
    if (active && colorId !== undefined) {
        return html`
            <i class="material-icons" style="color: ${colors[colorId].color};"
                >brush</i
            >
        `;
    } else {
        return html`
            <i class="material-icons">brush</i>
        `;
    }
};

export default class BrushTool extends Tool {
    constructor(brush, colors) {
        super("brush", "Paint", icon);
        this.brush = brush;
        this.colors = colors;
        this.options = new BrushToolOptions(brush, colors);

        hotkeys.filter = ({ target }) => {
            return (!["INPUT", "TEXTAREA"].includes(target.tagName)
              || (target.tagName === 'INPUT' && target.type.toLowerCase() !== 'text'));
        };
        hotkeys(`ctrl+z,command+z,control+z`, (evt, handler) => {
            // undo
            this.brush.undo();
            evt.preventDefault();
        });
        hotkeys(`ctrl+shift+z,command+shift+z,control+shift+z`, (evt, handler) => {
            // redo
            this.brush.redo();
            evt.preventDefault();
        });
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
        this.icon = icon(this.active, this.brush.color, this.colors);
        return super.render(selectTool);
    }
}

class BrushToolOptions {
    constructor(brush, colors, renderToolbar) {
        this.brush = brush;
        this.colors = colors;
        this.renderToolbar = renderToolbar;
        this.selectColor = this.selectColor.bind(this);
        this.changeRadius = this.changeRadius.bind(this);
        this.toggleBrushLock = this.toggleBrushLock.bind(this);
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
    toggleBrushLock() {
        this.brush.locked = this.brush.locked ? false : true;
    }
    render() {
        const activeColor = this.colors[this.brush.color].id;
        return html`
            ${this.colors.length > 1
                ? BrushColorPicker(this.colors, this.selectColor, activeColor)
                : ""}
            ${BrushSlider(this.brush.radius, this.changeRadius)}
            ${UndoRedo(this.brush)}
            ${this.colors.length > 1
                ? BrushLock(this.brush.locked, this.toggleBrushLock)
                : ""}
        `;
    }
}

const BrushLock = (locked, toggle) => html`
    <div class="ui-option">
        <label class="toolbar-checkbox">
            <input
                type="checkbox"
                name="brush-lock"
                value="brush-lock"
                ?checked=${locked}
                @change=${toggle}
            />
            Lock already-drawn districts
        </label>
    </div>
`;
