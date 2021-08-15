import { Hover } from "./Hover";
import { bindAll } from "../utils";

export default class Eyedropper extends Hover {
    constructor(layer, brush) {
        super(layer);
        this.brush = brush;
        this.id = Math.random();

        this.listeners = {
            colorend: [],
            colorfeature: [],
            colorop: [],
            undo: [],
            redo: []
        };
        bindAll(["onClick"],
            this);
    }
    clearUndo() {
        this.cursorUndo = 0;
        this.trackUndo = [{
            color: "test",
            initial: true,
        }];
    }
    onClick() {
        this.setColor(this.hoveredFeature.state.color);
    }
    setColor(color) {
        this.brush.color = parseInt(color);
    }
    activate(mouseover) {
        super.activate(mouseover);
        if (mouseover) {
            return;
        }

        this.layer.map.getCanvas().classList.add("brush-tool");
        this.layer.map.dragPan.disable();
        this.layer.map.touchZoomRotate.disable();
        this.layer.map.doubleClickZoom.disable();

        this.layer.on("click", this.onClick);
    }
    deactivate(mouseover) {
        super.deactivate(mouseover);
        if (mouseover) {
            return;
        }

        this.hoverOff();
        this.layer.map.getCanvas().classList.remove("brush-tool");
        this.layer.map.dragPan.enable();
        this.layer.map.doubleClickZoom.enable();
        this.layer.map.touchZoomRotate.enable();

        this.layer.off("click", this.onClick);
    }
    on(event, listener) {
        this.listeners[event].push(listener);
    }
}
