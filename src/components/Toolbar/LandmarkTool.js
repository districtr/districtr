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

        bindAll(["updateLandmarkList", "saveFeature"], this);

        let lm = state.place.landmarks;
        if (!lm.source && !lm.type) {
            // initialize a blank landmarks object
            // we cannot replace the object, which is used to remember landmarks
            lm.type = "geojson";
            lm.data = {"type": "FeatureCollection", "features": []};
        }
        // compatibility with old landmarks
        lm = lm.source || lm;

        // remove landmarks which were being drawn and not saved
        for (let prune = lm.data.features.length - 1; prune >= 0; prune--) {
            if (lm.data.features[prune].number_id) {
                lm.data.features.splice(prune, 1);
            }
        }

        this.landmarks = new Landmarks(state.map, lm, this.updateLandmarkList);
        this.options = new LandmarkOptions(
            this.landmarks,
            lm.data.features,
            this.saveFeature,
            this.renderCallback
        );
    }
    updateLandmarkList(selectLastFeature) {
        savePlanToStorage(this.state.serialize());
        if (selectLastFeature) {
            this.options.handleSelectFeature(-1);
            // handleSelectFeature already calls renderCallback
        } else {
            this.renderCallback();
        }
    }
    saveFeature(id) {
        this.landmarks.saveFeature(id);
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
    constructor(drawTool, features, saveFeature, renderCallback) {
        this.drawTool = drawTool;
        this.features = features;
        this.saveFeature = saveFeature;
        this.renderCallback = renderCallback;

        bindAll(["handleSelectFeature", "onSave", "setName"], this);

        this.selectFeature = this.features.length ? 0 : null;
        this.updateName = this.features.length ? this.features[0].properties.name : null;
    }
    handleSelectFeature(e) {
        // e can be set to -1 (most recent layer)
        this.selectFeature = (e > -1) ? e : (this.features.length - 1);
        this.updateName = this.features[this.selectFeature].properties.name;
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
            this.saveFeature(this.features[this.selectFeature].id);
            this.render();
        }
    }
    render() {
        let properties = this.features.map(feature => feature.properties);
        if (this.features.length && !this.selectFeature) {
            // when we add our first feature, this selects it
            this.selectFeature = 0;
        }

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
                      label: "Edit:",
                      element: Select(
                          properties,
                          this.handleSelectFeature,
                          this.selectFeature
                      )
                  })
                : ""}
        </li>
    </ul>

    ${this.features.length ? LandmarkFormTemplate({
        name: properties[this.selectFeature].name,
        saved: false,
        onSave: this.onSave,
        setName: this.setName
    }) : "Add landmarks using the polygon and marker buttons on the top right of the map."}
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
