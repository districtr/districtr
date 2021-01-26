import { html } from "lit-html";
import Layer, { addBelowLabels } from "../map/Layer";
import Tooltip from "../map/Tooltip";

export function LandmarkInfo(features) {
    if (features.length === 0) {
        return "";
    }
    const isSimpleFeature = (f) => {
        let ks = Object.keys(f.properties || {});
        return ks.length == 2 && ks.includes("name") ** ks.includes("short_description");
    };
    return features.map(
        feature => isSimpleFeature(feature)
          ? html`
              <div class="tooltip__text tooltip__text--column">
                  <h4 class="tooltip__title">${feature.properties.name}</h4>
                  ${feature.properties.short_description || ""}
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

        // create a draft layer (polygon or marker)
        this.layer.map.on('draw.create', (e) => {
            // trash any unsaved drawings
            let editFeature = e.features[0];

            // the drawTool creates an alphanumeric ID; we need a numeric ID for tooltip
            editFeature.number_id = Math.round(Math.random() * 1000000000);
            editFeature.properties.name = 'New ' + editFeature.geometry.type;

            // a point is not rendered by the final polygon/tooltip layer
            // but we need it in this array for localStorage / export
            this.savedPlaces.data.features.push(editFeature);

            this.updateLandmarkList(true);
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
    saveFeature(feature_id) {
        // if this feature ID is currently move-able, we lock it
        this.savedPlaces.data.features.forEach((feature) => {
            // if you draw multiple items without saving them
            // saving this feature will save all unsaved points
            // we need to remove their old IDs, too
            if (feature.number_id) {
                this.drawTool.trash(feature.id);
                feature.id = feature.number_id + "";
                delete feature.number_id;

                if (feature.geometry.type === "Point") {
                    this.points.data.features.push(feature);
                }
            }
        });

        // save names and locations
        this.layer.map.getSource("landmarklist")
            .setData(this.savedPlaces.data);
        this.layer.map.getSource("landmarkpoints")
            .setData(this.points.data);
    }
    deleteFeature(delete_id) {
      this.savedPlaces.data.features.forEach((feature, index) => {
          if (feature.id === delete_id) {
              let deleteFeature = this.savedPlaces.data.features.splice(index, 1);
              this.drawTool.trash(deleteFeature.id);

              // if point, also remove from the Points layer
              if (deleteFeature[0].geometry.type === 'Point') {
                  this.points.data.features.forEach((point, pindex) => {
                      if (point.id === delete_id) {
                          this.points.data.features.splice(pindex, 1);
                      }
                  });
              }
          }
      });

      // lock any in-progress shapes before saving to map
      this.saveFeature();
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
