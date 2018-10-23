export default class Brush {
    constructor(hover, color) {
        this.hover = hover;
        this.color = color;

        this.colorFeatures = this.colorFeatures.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
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
    onMouseDown() {
        this.hover.layer.on("mousemove", this.colorFeatures);
        window.addEventListener("mouseup", this.onMouseUp);
    }
    onMouseUp() {
        this.hover.layer.off("mousemove", this.colorFeatures);
        document.removeEventListener("mouseup", this.onMouseUp);
    }
    activate() {
        this.hover.layer.map.getCanvas().classList.add("brush-tool");

        this.hover.activate();

        this.hover.layer.map.dragPan.disable();
        this.hover.layer.map.doubleClickZoom.disable();

        this.hover.layer.on("click", this.colorFeatures);

        window.addEventListener("mousedown", this.onMouseDown);
    }
    deactivate() {
        this.hover.layer.map.getCanvas().classList.remove("brush-tool");

        this.hover.deactivate();

        this.hover.layer.map.dragPan.enable();
        this.hover.layer.map.doubleClickZoom.enable();

        this.hover.layer.off("click", this.colorFeatures);

        window.removeEventListener("mousedown", this.onMouseDown);
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
