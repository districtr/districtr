import { html } from "lit-html";
import Layer, { addBelowLabels } from "../Layers/Layer";
import Tooltip from "../Map/Tooltip";

export function LandmarkInfo(features) {
    if (features.length === 0) {
        return "";
    }
    return features.map(
        feature => html`
            <div class="tooltip-text">
                <h4 class="tooltip-title">${feature.properties.name}</h4>
                <p>${feature.properties.short_description}</p>
            </div>
        `
    );
}

const landmarkPaintProperty = {
    "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        // "#1f8653",
        // "#2bb972"
        // "#70b002",
        // "#8cdc02"
        "#54b321",
        "#64db24"
        // "#98e86d"
    ]
};

export class Landmarks {
    constructor(map, landmarksRecord) {
        this.layer = new Layer(
            map,
            {
                ...landmarksRecord,
                paint: landmarkPaintProperty
            },
            addBelowLabels
        );
        this.landmarksTooltip = new Tooltip(this.layer, LandmarkInfo, 5);
        this.landmarksTooltip.activate();

        this.handleToggle = this.handleToggle.bind(this);
    }
    handleToggle(checked) {
        if (checked) {
            this.layer.setOpacity(0.8);
            this.landmarksTooltip.activate();
        } else {
            this.layer.setOpacity(0);
            this.landmarksTooltip.deactivate();
        }
    }
}
