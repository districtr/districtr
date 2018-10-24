import { HoverWithRadius } from "./Hover";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color, callback, postColoringCallback) {
        super(layer, radius);

        this.color = color;
        this.coloring = false;
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
    hoverOn(features) {
        this.hoveredFeatures = features;

        if (this.coloring === true) {
            this.colorFeatures();
        } else {
            super.hoverOn(features);
        }
    }
    colorFeatures() {
        for (let feature of this.hoveredFeatures) {
            if (feature.state.color !== this.color) {
                this.callback(feature, this.color);
                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    color: this.color,
                    hover: true
                });
                feature.state.color = this.color;
                console.log(this.layer.getFeatureState(feature.id));
                console.log(feature);
            } else {
                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    hover: true
                });
            }
        }
    }
    onClick() {
        this.colorFeatures();
        this.postColoringCallback();
    }
    onMouseDown() {
        this.coloring = true;
        window.addEventListener("mouseup", this.onMouseUp);
    }
    onMouseUp() {
        this.coloring = false;
        this.postColoringCallback();
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
    }
}

export class BrushSlider {
    constructor(rangeInput, numberInput, brush) {
        this.rangeInput = rangeInput;
        this.numberInput = numberInput;
        this.brush = brush;

        rangeInput.addEventListener("input", this.onChangeRadius.bind(this));
        numberInput.addEventListener("input", this.onChangeRadius.bind(this));
    }
    onChangeRadius(e) {
        e.stopPropagation();
        let value = parseInt(e.target.value);
        if (this.brush.radius != value) {
            this.brush.radius = value;
            this.numberInput.value = value;
            this.rangeInput.value = value;
        }
    }
}

export class BrushColorPicker {
    constructor(brush, colorIds) {
        this.brush = brush;

        this.selectColor = this.selectColor.bind(this);

        const elements = colorIds.map(id => document.getElementById(id));
        for (let element of elements) {
            if (element.checked) {
                this.brush.setColor(element.value);
            }
            element.addEventListener("input", this.selectColor);
        }
    }
    selectColor(e) {
        this.brush.setColor(e.target.value);
    }
}
