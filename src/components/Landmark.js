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

const landmarkCircleProperty = {
    'circle-opacity': 0,
    'circle-radius': 8,
    'circle-color': [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#ff4f49",
        "#e44944"
    ]
};

export class Landmarks {
    constructor(map, landmarksRecord) {
        this.landmarksRecord = landmarksRecord.source || landmarksRecord;
        map.addSource("landmarklist", this.landmarksRecord);
        this.layer = new Layer(
            map,
            {
                id: "landmarks",
                type: "fill",
                source: "landmarklist",
                paint: landmarkPaintProperty,
            },
            addBelowLabels
        );

        this.points = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: this.landmarksRecord.data.features.filter(f =>
                    f.geometry.type === 'Point')
            }
        };
        map.addSource("landmarkpoints", this.points);
        this.landmarksTooltip = new Tooltip(this.layer, LandmarkInfo, 5);

        this.markerlayer = new Layer(
            map,
            {
                id: "landmarkpoints",
                type: "circle",
                source: "landmarkpoints",
                paint: landmarkCircleProperty,
            },
            addBelowLabels
        );
        this.ptsTooltip = new Tooltip(this.markerlayer, LandmarkInfo, 5);

        this.visible = false;

        this.drawTool = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                point: true,
                polygon: true,
                //trash: true
            }
        });

        this.layer.map.on('draw.create', (e) => {
            let name = window.prompt('What is the name of this landmark?')
            if (name) {
                e.features.forEach((feature) => {
                    feature.properties.name = name;
                    this.drawTool.trash(feature.id);
                    feature.id = Math.round(Math.random() * 1000000000);

                    if (feature.geometry.type === "Point") {
                        this.points.data.features.push(feature);
                    }
                    // a point is not rendered by the polygon layer
                    // but we need to have it available for localStorage / export
                    this.landmarksRecord.data.features.push(feature);
                });

                this.layer.map.getSource("landmarklist")
                    .setData(this.landmarksRecord.data);
                this.layer.map.getSource("landmarkpoints")
                    .setData(this.points.data);
            } else {
                // cancel / remove landmark
                e.features.forEach((feature) => {
                    this.drawTool.trash(feature.id);
                });
            }
        });
        this.layer.map.on('draw.update', (e) => {
            console.log(e.features);
            console.log(e.action);
            return false;
        });

        this.handleToggle = this.handleToggle.bind(this);
        this.handleDrawToggle = this.handleDrawToggle.bind(this);
    }
    handleToggle(checked) {
        this.visible = checked;
        if (checked) {
            this.layer.setOpacity(0.5);
            this.landmarksTooltip.activate();
            this.markerlayer.setOpacity(0.5);
            this.ptsTooltip.activate();
        } else {
            this.layer.setOpacity(0);
            this.landmarksTooltip.deactivate();
            this.markerlayer.setOpacity(0);
            this.ptsTooltip.deactivate();
        }
    }
    handleDrawToggle(checked) {
        if (checked) {
            // makes no sense to draw without visible landmarks
            this.layer.map.addControl(this.drawTool, "top-right");

            this.handleToggle(true);
        } else {
            this.layer.map.removeControl(this.drawTool);
        }
    }
}
