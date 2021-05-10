import { html } from "lit-html";
import Layer, { addBelowLabels } from "../map/Layer";
import Tooltip from "../map/Tooltip";

export function LandmarkInfo(features) {
    if (features.length === 0) {
        return "";
    }
    const isSimpleFeature = (f) => {
        let ks = Object.keys(f.properties || {});
        return ks.includes("name") && (ks.includes("short_description") || ks.includes("shortDescription"));
    };
    return features.map(
        feature => isSimpleFeature(feature)
          ? html`
              <div class="tooltip__text tooltip__text--column">
                  <h4 class="tooltip__title">${feature.properties.name}</h4>
                  ${feature.properties.short_description || feature.properties.shortDescription || ""}
              </div>
          `
          : html`
              <div class="tooltip__text tooltip__text--column">
                  <h4 class="tooltip__title">Imported GeoJSON</h4>
                  <table>
                    ${Object.keys(feature.properties).map(k => html`<tr>
                      <td>${k}</td>
                      <td>${feature.properties[k]}</td>
                    </tr>`)}
                  </table>
              </div>
          `
    );
}

const landmarkPaintProperty = {
    "fill-opacity": 0.5, // turn off the highlights by default
    "fill-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#ff4f49",
        "#e44944"
    ]
};

const landmarkCircleProperty = {
    'circle-opacity': 0.5,
    'circle-radius': 8,
    'circle-color': [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#ff4f49",
        "#e44944"
    ]
};

export class Landmarks {
    constructor(map, savedPlaces, updateLandmarkList) {
        this.visible = true;
        this.savedPlaces = savedPlaces;
        this.updateLandmarkList = updateLandmarkList;

        // polygon landmarks and tooltip
        map.addSource("landmarklist", this.savedPlaces);
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
        this.landmarksTooltip = new Tooltip(this.layer, LandmarkInfo, 5);
        this.landmarksTooltip.activate();

        // point landmarks and tooltip
        this.points = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: this.savedPlaces.data.features.filter(f =>
                    f.geometry.type === 'Point')
            }
        };
        map.addSource("landmarkpoints", this.points);
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
        this.ptsTooltip.activate();

        // MapBox GL Draw tool
        this.drawTool = new MapboxDraw({
            displayControlsDefault: false,
            controls: {
                point: true,
                //polygon: true,
                //trash: true
            }
        });
        this.layer.map.addControl(this.drawTool, "top-right");

        // create a draft layer (polygon or marker)
        this.layer.map.on('draw.create', (e) => {
            // trash any unsaved drawings
            let editFeature = e.features[0];

            // the drawTool creates an alphanumeric ID; we need a numeric ID for tooltip
            editFeature.number_id = Math.round(Math.random() * 1000000000);
            editFeature.properties.name = `New ${editFeature.geometry.type} ${this.savedPlaces.data.features.length + 1}`;
            editFeature.properties.short_description = '';

            // a point is not rendered by the final polygon/tooltip layer
            // but we need it in this array for localStorage / export
            this.savedPlaces.data.features.push(editFeature);

            this.updateLandmarkList(true);

            // document.querySelector("#landmark-instruction").style.visibility = "hidden";
        });

        // update position of draft layer
        this.layer.map.on('draw.update', (e) => {
            // does dragged location get saved automatically?
            e.features.forEach((editFeature) => {
                this.savedPlaces.data.features.forEach((feature) => {
                    if (editFeature.id === feature.id) {
                        feature.geometry = editFeature.geometry;
                    }
                });
            });
        });

        this.handleToggle = this.handleToggle.bind(this);
        this.handleDrawToggle = this.handleDrawToggle.bind(this);
    }
    handleToggle(checked) {
        if (checked && !this.visible) {
            this.layer.setOpacity(0.5);
            this.landmarksTooltip.activate();
            this.markerlayer.setOpacity(0.5);
            this.ptsTooltip.activate();
        } else if (!checked && this.visible) {
            this.layer.setOpacity(0);
            this.landmarksTooltip.deactivate();
            this.markerlayer.setOpacity(0);
            this.ptsTooltip.deactivate();
        }
        this.visible = checked;
    }
    handleDrawToggle(checked) {
        if (checked) {
            // when opening draw, make landmarks visible
            this.layer.map.addControl(this.drawTool, "top-right");
            this.handleToggle(true);
        } else {
            this.layer.map.removeControl(this.drawTool);
        }
    }
}
