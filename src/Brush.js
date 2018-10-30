import { HoverWithRadius } from "./Hover";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color, callback, postColoringCallback) {
        super(layer, radius);

        this.color = color;
        this.coloring = false;
        this.locked = false;
        this.callback = callback ? callback : () => null;
        this.postColoringCallback = postColoringCallback
            ? postColoringCallback
            : () => null;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);
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
            this.colorFeaturesLocked();
        } else {
            this.colorFeaturesUnlocked();
        }
    }
    colorFeaturesUnlocked() {
        let seenFeatures = new Set();
        for (let feature of this.hoveredFeatures) {
            if (feature.state.color !== this.color) {
                if (!seenFeatures.has(feature.id)) {
                    seenFeatures.add(feature.id);
                    this.callback(feature, this.color);
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
        this.postColoringCallback();
    }
    colorFeaturesLocked() {
        let seenFeatures = new Set();
        for (let feature of this.hoveredFeatures) {
            // This is the only difference between this and the unlocked version:
            if (
                feature.state.color === null ||
                feature.state.color === undefined
            ) {
                if (!seenFeatures.has(feature.id)) {
                    seenFeatures.add(feature.id);
                    this.callback(feature, this.color);
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
        this.postColoringCallback();
    }
    onClick() {
        this.colorFeatures();
    }
    onMouseDown() {
        this.coloring = true;
        window.addEventListener("mouseup", this.onMouseUp);
    }
    onMouseUp() {
        this.coloring = false;
        window.removeEventListener("mouseup", this.onMouseUp);
    }
    activate() {
        this.layer.map.getCanvas().classList.add("brush-tool");

        super.activate();

        this.layer.map.dragPan.disable();
        this.layer.map.doubleClickZoom.disable();

        this.layer.on("click", this.onClick);

        this.layer.map.on("mousedown", this.onMouseDown);
    }
    deactivate() {
        this.layer.map.getCanvas().classList.remove("brush-tool");

        super.deactivate();

        this.layer.map.dragPan.enable();
        this.layer.map.doubleClickZoom.enable();

        this.layer.off("click", this.onClick);

        this.layer.map.off("mousedown", this.onMouseDown);

        this.locked = false;
    }
}
