import { html } from "lit-html";
import Layer, { addBelowLabels } from "../map/Layer";
import Tooltip from "../map/Tooltip";

export function LandmarkInfo(features) {
    if (features.length === 0) {
        return "";
    }
    return features.map(
        feature => html`
            <div class="tooltip__text tooltip__text--column">
                <h4 class="tooltip__title">${feature.properties.name}</h4>
                ${feature.properties.short_description
                    ? html`
                          <p>${html([feature.properties.short_description])}</p>
                      `
                    : ""}
            </div>
        `
    );
}

const landmarkPaintProperty = {
    "fill-opacity": 0, // turn off the highlights by default
    "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        // "#1f8653",
        // "#2bb972"
        "#ff4f49",
        "#e44944"
        // "#70b002",
        // "#8cdc02"
        // "#54b321",
        // "#64db24"
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
        this.visible = false;

        this.handleToggle = this.handleToggle.bind(this);
    }
    handleToggle(checked) {
        this.visible = checked;
        if (checked) {
            this.layer.setOpacity(0.5);
            this.landmarksTooltip.activate();
        } else {
            this.layer.setOpacity(0);
            this.landmarksTooltip.deactivate();
        }
    }
}
