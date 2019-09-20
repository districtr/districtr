import { html } from "lit-html";
import { toggle } from "../Toggle";

import { savePlanToStorage } from "../../routes";
import { bindAll } from "../../utils";
import { Landmarks } from "../Landmark";
import Tool from "./Tool";
import Parameter from "../Parameter";
import Select from "../Select";

export default class LandmarkTool extends Tool {
    constructor(state) {
        const icon = html`<i class="material-icons">label</i>`;
        super("landmark", "Landmark", icon);

        this.state = state;
        this.renderCallback = state.render;

        bindAll(["updateLandmarkList", "updateFeatureName"], this);

        let lm = state.place.landmarks;
        if (!lm.source && !lm.type) {
            // initialize a blank landmarks object
            // we cannot replace the object, which is used to remember landmarks
            lm.type = "geojson";
            lm.data = {"type": "FeatureCollection", "features": []};
        }
        // compatibility with old landmarks
        lm = lm.source || lm;

        this.landmarks = new Landmarks(state.map, lm, this.updateLandmarkList);
        this.options = new LandmarkOptions(
            this.landmarks,
            lm.data.features,
            this.updateFeatureName,
            this.renderCallback
        );
    }
    updateLandmarkList() {
        savePlanToStorage(this.state.serialize());
        this.renderCallback();
    }
    updateFeatureName() {
        this.landmarks.updateFeatures();
        savePlanToStorage(this.state.serialize());
        this.renderCallback();
    }
    activate() {
        super.activate();
        // enable / disable drawing toolbar
        this.landmarks.handleDrawToggle(true);
    }
    deactivate() {
        super.deactivate();
        this.landmarks.handleDrawToggle(false);
    }
}

class LandmarkOptions {
    constructor(drawTool, features, updateFeatureName, renderCallback) {
        this.drawTool = drawTool;
        this.features = features;
        this.updateFeatureName = updateFeatureName;
        this.renderCallback = renderCallback;

        bindAll(["handleSelectFeature", "onSave", "setName"], this);

        this.selectFeature = this.features.length ? 0 : null;
        this.updateName = this.features.length ? this.features[0].properties.name : null;
    }
    handleSelectFeature(e) {
        this.selectFeature = e;
        this.renderCallback();
    }
    setName(name) {
        // remember but don't save to map and localStorage
        this.updateName = name;
    }
    onSave() {
        // commit updateName to map and localStorage
        if (this.updateName !== null) {
            this.features[this.selectFeature].properties.name = this.updateName;
            this.updateFeatureName();
            this.render();
        }
    }
    render() {
        let properties = this.features.map(feature => feature.properties);

        return html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">Landmarks</legend>
        ${toggle(
            "Show landmarks",
            this.drawTool.visible,
            this.drawTool.handleToggle
        )}
    </div>
    <ul class="option-list">
        <li class="option-list__item">
            ${properties.length > 1
                ? Parameter({
                      label: "Community:",
                      element: Select(
                          properties,
                          this.handleSelectFeature
                      )
                  })
                : ""}
        </li>
    </ul>

    ${this.features.length && LandmarkFormTemplate({
        name: properties[this.selectFeature].name,
        saved: false,
        onSave: this.onSave,
        setName: this.setName
    })}
        `;
    }
}


function LandmarkFormTemplate({
    name,
    //description,
    saved,
    onSave,
    setName,
    //setDescription
}) {
    return html`
        <ul class="option-list">
            <li class="option-list__item">
                <label class="ui-label">Name</label>
                <input
                    type="text"
                    class="text-input"
                    .value="${name}"
                    @input=${e => setName(e.target.value)}
                    @blur=${e => setName(e.target.value)}
                />
            </li>
            <li class="option-list__item">
                <button
                    ?disabled=${saved}
                    class="button button--submit button--${saved
                        ? "disabled"
                        : "alternate"} ui-label"
                    @click=${onSave}
                >
                    ${saved ? "Saved" : "Save"}
                </button>
            </li>
        </ul>
    `;
}
