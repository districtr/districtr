export default class Brush {
    constructor(hover, color) {
        this.hover = hover;
        this.color = color;

        this.colorFeatures = this.colorFeatures.bind(this);
    }
    setColor(color) {
        this.color = color;
    }
    setRadius(radius) {
        this.hover.setRadius(radius);
    }
    getRadius() {
        return this.hover.radius;
    }
    colorFeatures() {
        this.hover.hoveredFeatures.forEach(feature => {
            this.hover.layer.setFeatureState(feature.id, { color: this.color });
        });
    }
    activate() {
        this.hover.activate();
        this.hover.layer.map.dragPan.disable();
        this.hover.layer.on("mousedown", this.colorFeatures);
    }
    deactivate() {
        this.hover.deactivate();
        this.hover.layer.map.dragPan.enable();
        this.hover.layer.off("mousedown", this.colorFeatures);
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
        if (this.brush.getRadius() != value) {
            this.brush.setRadius(value);
            this.numberInput.value = value;
            this.rangeInput.value = value;
        }
    }
}
