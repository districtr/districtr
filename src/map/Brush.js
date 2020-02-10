import { HoverWithRadius } from "./Hover";
import { bindAll } from "../utils";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color) {
        super(layer, radius);

        this.id = Math.random();
        this.color = color;
        this.coloring = false;
        this.locked = false;

        this.listeners = {
            colorend: [],
            colorfeature: [],
            colorop: [],
            undo: [],
            redo: []
        };
        bindAll(["onMouseDown", "onMouseUp", "onClick", "onTouchStart", "undo", "redo", "clearUndo"],
            this);
        this.clearUndo();
    }
    clearUndo() {
        this.cursorUndo = 0;
        this.trackUndo = [{
            color: this.color
        }];
    }
    setColor(color) {
        this.color = parseInt(color);
    }
    startErasing() {
        this._previousColor = this.color;
        this.color = null;
        this.erasing = true;
    }
    stopErasing() {
        this.color = this._previousColor;
        this.erasing = false;
    }
    hoverOn(features) {
        this.hoveredFeatures = features;

        if (this.coloring === true) {
            this.colorFeatures();
        } else {
            super.hoverOn(features);
        }
    }
    colorFeatures() {
        if (this.locked && !this.erasing) {
            this._colorFeatures(
                feature =>
                    feature.state.color === null ||
                    feature.state.color === undefined
            );
        } else {
            this._colorFeatures(feature => feature.state.color !== this.color);
        }
    }
    _colorFeatures(filter) {
        let seenFeatures = new Set();
        for (let feature of this.hoveredFeatures) {
            if (filter(feature)) {
                if (!seenFeatures.has(feature.id)) {
                    seenFeatures.add(feature.id);
                    for (let listener of this.listeners.colorfeature) {
                        listener(feature, this.color);
                    }
                }

                // remember feature's initial color once per paint event
                // remember population data so it can be un-counted
                if (!this.trackUndo[this.cursorUndo][feature.id]) {
                    this.trackUndo[this.cursorUndo][feature.id] = {
                        properties: feature.properties,
                        color: String(feature.state.color)
                    };
                }

                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    color: this.color,
                    hover: true
                });
                feature.state.color = this.color;
            } else {
                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    hover: true
                });
            }
        }
        for (let listener of this.listeners.colorend) {
            listener();
        }
    }
    onClick() {
        this.colorFeatures();
    }
    onMouseDown(e) {
        e.preventDefault();
        e.originalEvent.preventDefault();
        this.coloring = true;
        window.addEventListener("mouseup", this.onMouseUp);
        window.addEventListener("touchend", this.onMouseUp);
        window.addEventListener("touchcancel", this.onMouseUp);

        // after you undo, the cursor is in the middle of the undo stack (possible to redo an action)
        // when you draw new material, it is no longer possible to redo
        if (this.cursorUndo < this.trackUndo.length - 1) {
            this.trackUndo = this.trackUndo.slice(0, this.cursorUndo + 1);
        }

        // limit number of changes in the stack
        if (this.trackUndo.length > 19) {
            this.trackUndo = this.trackUndo.slice(1);
        }

        this.trackUndo.push({
            color: this.color
        });
        this.cursorUndo = this.trackUndo.length - 1;
    }
    onMouseUp() {
        this.coloring = false;
        window.removeEventListener("mouseup", this.onMouseUp);
        window.removeEventListener("touchend", this.onMouseUp);
        window.removeEventListener("touchcancel", this.onMouseUp);
        for (let listener of this.listeners.colorop) {
            listener();
        }
    }
    onTouchStart(e) {
        if (e.points && e.points.length <= 1) {
            this.onMouseDown(e);
        }
    }
    undo() {
        let listeners = this.listeners.colorfeature;
        let atomicAction = this.trackUndo[this.cursorUndo];
        let brushedColor = atomicAction.color;
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }
            // eraser color "undefined" should act like a brush set to null
            let amendColor = Number(atomicAction[fid].color);
            if (isNaN(amendColor)) {
                amendColor = null;
            }

            // change map colors
            this.layer.setFeatureState(fid, {
                color: amendColor
            });

            // update subgroup totals (restoring old brush color)
            for (let listener of listeners) {
                listener({
                    id: fid,
                    state: { color: brushedColor },
                    properties: atomicAction[fid].properties
                }, amendColor);
            }
        });

        this.cursorUndo = Math.max(0, this.cursorUndo - 1);

        // locally store plan state
        for (let listener of this.listeners.colorend.concat(this.listeners.colorop)) {
            listener(true);
        }
        for (let listener of this.listeners.undo) {
            listener(this.cursorUndo <= 0);
        }
    }
    redo() {
        // no undo stack to move into
        if (this.trackUndo.length < this.cursorUndo + 2) {
            return;
        }

        // move up in undo/redo stack
        this.cursorUndo++;
        let atomicAction = this.trackUndo[this.cursorUndo];
        let brushedColor = atomicAction.color;

        let listeners = this.listeners.colorfeature;
        Object.keys(atomicAction).forEach((fid) => {
            if (fid === "color") {
                return;
            }

            // eraser color "undefined" should act like a brush set to null
            let amendColor = Number(atomicAction[fid].color);
            if (isNaN(amendColor)) {
                amendColor = null;
            }

            // change map colors
            this.layer.setFeatureState(fid, {
                color: brushedColor
            });

            // update subgroup totals (restoring old brush color)
            for (let listener of listeners) {
                listener({
                    id: fid,
                    state: { color: amendColor },
                    properties: atomicAction[fid].properties
                }, brushedColor);
            }
        });

        // locally store plan state
        for (let listener of this.listeners.colorend.concat(this.listeners.colorop)) {
            listener(true);
        }
        for (let listener of this.listeners.redo) {
            listener(this.cursorUndo >= this.trackUndo.length - 1);
        }
    }
    activate() {
        this.layer.map.getCanvas().classList.add("brush-tool");

        super.activate();

        this.layer.map.dragPan.disable();
        this.layer.map.touchZoomRotate.disable();
        this.layer.map.doubleClickZoom.disable();

        this.layer.on("click", this.onClick);
        this.layer.map.on("touchstart", this.onTouchStart);
        this.layer.map.on("mousedown", this.onMouseDown);
    }
    deactivate() {
        this.layer.map.getCanvas().classList.remove("brush-tool");

        super.deactivate();

        this.layer.map.dragPan.enable();
        this.layer.map.doubleClickZoom.enable();
        this.layer.map.touchZoomRotate.enable();

        this.layer.off("click", this.onClick);
        this.layer.map.off("touchstart", this.onMouseDown);
        this.layer.map.off("mousedown", this.onMouseDown);
    }
    on(event, listener) {
        this.listeners[event].push(listener);
    }
}
