import { HoverWithRadius } from "./Hover";

export default class Brush extends HoverWithRadius {
    constructor(layer, radius, color, callback) {
        super(layer, radius);

        this.color = color;
        this.coloring = false;
        this.callback = callback;

        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
        this.onClick = this.onClick.bind(this);
    }
    setColor(color) {
        this.color = color;
    }
    hoverOn(features) {
        this.hoveredFeatures = features;

        this.hoveredFeatures.forEach(feature => {
            if (this.coloring === true && feature.color !== this.color) {
                this.layer.setFeatureState(feature.id, {
                    color: this.color,
                    hover: true
                });
                feature.color = this.color;
            } else {
                this.layer.setFeatureState(feature.id, { hover: true });
            }
        });
    }
    onClick(e) {
        this.layer.setFeatureState(e.target.id, { color: this.color });
    }
    onMouseDown() {
        this.coloring = true;
    }
    onMouseUp() {
        this.coloring = false;
    }
    activate() {
        this.layer.map.getCanvas().classList.add("brush-tool");

        super.activate();

        this.layer.map.dragPan.disable();
        this.layer.map.doubleClickZoom.disable();

        this.layer.on("click", this.onClick);

        window.addEventListener("mousedown", this.onMouseDown);
        window.addEventListener("mouseup", this.onMouseUp);
    }
    deactivate() {
        this.layer.map.getCanvas().classList.remove("brush-tool");

        super.deactivate();

        this.layer.map.dragPan.enable();
        this.layer.map.doubleClickZoom.enable();

        this.layer.off("click", this.onClick);

        window.removeEventListener("mousedown", this.onMouseDown);
        window.removeEventListener("mouseup", this.onMouseUp);
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
                this.brush.setColor(parseInt(element.value));
            }
            element.addEventListener("input", this.selectColor);
        }
    }
    selectColor(e) {
        const color = parseInt(e.target.value);
        this.brush.setColor(color);
    }
}
