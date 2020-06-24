export class Hover {
    constructor(layer) {
        this.layer = layer;

        this.hoveredFeature = null;
        this.deactivatedHover = false;

        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.hoverOff = this.hoverOff.bind(this);
    }
    hoverOff() {
        if (this.hoveredFeature !== null) {
            this.layer.setFeatureState(this.hoveredFeature.id, {
                ...this.hoveredFeature.state,
                hover: false
            });
            this.hoveredFeature = null;
        }
    }
    hoverOn(feature) {
        this.hoveredFeature = feature;
        if (!this.deactivatedHover) {
            this.layer.setFeatureState(feature.id, {
                ...feature.state,
                hover: true
            });
        }
    }
    onMouseMove(e) {
        if (e.features.length > 0) {
            this.hoverOff();
            this.hoverOn(e.features[0]);
        }
    }
    onMouseLeave() {
        this.hoverOff();
    }
    activate(mouseover) {
        if (mouseover) {
            this.deactivatedHover = false;
            return;
        }
        this.layer.on("mousemove", this.onMouseMove);
        this.layer.on("mouseleave", this.onMouseLeave);
        this.layer.on("touchmove", this.onMouseMove);
        this.layer.on("touchend", this.onMouseLeave);
    }
    deactivate(mouseover) {
        if (mouseover) {
            this.deactivatedHover = true;
            return;
        }
        this.layer.off("mousemove", this.onMouseMove);
        this.layer.off("mouseleave", this.onMouseLeave);
        this.layer.off("touchmove", this.onMouseMove);
        this.layer.off("touchend", this.onMouseLeave);
    }
}

export class HoverWithRadius extends Hover {
    constructor(layer, radius) {
        super(layer);

        this.radius = radius;
        this.hoveredFeatures = [];
    }
    hoverOff() {
        this.hoveredFeatures.forEach(feature => {
            let featureState = this.layer.getFeatureState(feature.id);
            this.layer.setFeatureState(feature.id, {
                ...featureState,
                hover: false
            });
        });
        this.hoveredFeatures = [];
    }
    hoverOn(features) {
        this.hoveredFeatures = features;
        if (!this.deactivatedHover) {
            this.hoveredFeatures.forEach(feature => {
                this.layer.setFeatureState(feature.id, {
                    ...feature.state,
                    hover: true
                });
            });
        }
    }
    onMouseMove(e) {
        const box = boxAround(e.point, this.radius);
        const features = this.layer.map.queryRenderedFeatures(box, {
            layers: [this.layer.id]
        });
        if (features.length > 0) {
            this.hoverOff();
            this.hoverOn(features);
        }
    }
}

function boxAround(point, radius) {
    const southwest = [point.x + radius, point.y + radius];
    const northeast = [point.x - radius, point.y - radius];
    return [northeast, southwest];
}
