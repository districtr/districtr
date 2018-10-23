export class HoverWithRadius {
    constructor(layer, radius) {
        this.layer = layer;
        this.radius = radius;

        this.hoveredFeatures = [];

        this.onMouseMove = this.onMouseMove.bind(this);
        this.hoverOff = this.hoverOff.bind(this);
    }
    hoverOff() {
        while (this.hoveredFeatures.length > 0) {
            let feature = this.hoveredFeatures.pop();
            this.layer.setFeatureState(feature.id, { hover: false });
        }
    }
    hoverOn(features) {
        this.hoveredFeatures = features;
        this.hoveredFeatures.forEach(feature => {
            this.layer.setFeatureState(feature.id, { hover: true });
        });
    }
    onMouseMove(e) {
        const box = boxAround(e.point, this.radius, this.layer.map);
        const features = this.layer.map.queryRenderedFeatures(box, {
            layers: [this.layer.id]
        });
        if (features.length > 0) {
            this.hoverOff();
            this.hoverOn(features);
        }
    }
    setRadius(radius) {
        this.radius = radius;
    }
    activate() {
        this.layer.on("mousemove", this.onMouseMove);
        this.layer.on("mouseleave", this.hoverOff);
    }
    deactivate() {
        this.layer.off("mousemove", this.onMouseMove);
        this.layer.off("mouseleave", this.hoverOff);
    }
}

function boxAround(point, radius, map) {
    const southwest = [point.x + radius, point.y + radius];
    const northeast = [point.x - radius, point.y - radius];
    return [northeast, southwest];
}
