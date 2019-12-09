import { HoverWithRadius } from "./Hover";
import { bindAll } from "../utils";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color) {
        super(layer, radius);

        this.color = color;
        this.coloring = false;
        this.locked = false;

        this.listeners = {
            colorend: [],
            colorfeature: [],
            colorop: []
        };
        bindAll(["onMouseDown", "onMouseUp", "onClick", "onTouchStart", "undo", "clearUndo"], this);
        this.clearUndo();
    }
    clearUndo() {
        this.trackUndo = {};
    }
    setColor(color) {
        this.color = parseInt(color);
        this.clearUndo();
    }
    startErasing() {
        this._previousColor = this.color;
        this.color = null;
        this.erasing = true;
        this.clearUndo();
    }
    stopErasing() {
        this.color = this._previousColor;
        this.erasing = false;
        this.clearUndo();
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
                if (!this.trackUndo[feature.id]) {
                    this.trackUndo[feature.id] = {
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
        this.trackUndo = [];
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
        Object.keys(this.trackUndo).forEach((fid) => {
            // eraser color "undefined" should act like a brush set to null
            let amendColor = Number(this.trackUndo[fid].color);
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
                    state: { color: this.color },
                    properties: this.trackUndo[fid].properties
                }, amendColor);
            }
        });
        this.clearUndo();

        // locally store plan state
        for (let listener of this.listeners.colorend.concat(this.listeners.colorop)) {
            listener();
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
