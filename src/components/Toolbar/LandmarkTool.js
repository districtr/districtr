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
        const icon = html`<img src="/assets/Icons_Landmark_grey.svg"alt="Landmark"/>`;
        super("landmark", "Landmark", icon, state.problem.type !== "community");

        this.state = state;
        this.renderCallback = state.render;

        bindAll(["saveFeature", "deleteFeature", "updateLandmarkList"],
            this);

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
        lm.data.features = lm.data.features.filter(f => !f.number_id);

        this.landmarks = new Landmarks(state.map, lm, this.updateLandmarkList);
        this.options = new LandmarkOptions(
            this.landmarks,
            lm.data.features,
            this.saveFeature,
            this.deleteFeature,
            this.renderCallback
        );
    }
    updateLandmarkList(selectLastFeature) {
        savePlanToStorage(this.state.serialize());
        this.renderCallback();
    }
    saveFeature(id) {
        this.landmarks.saveFeature(id);
        savePlanToStorage(this.state.serialize());
        this.renderCallback();
    }
    deleteFeature(id) {
        this.landmarks.deleteFeature(id);
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
        try {
          document.querySelector(".mapboxgl-canvas-container").classList.remove("mapboxgl-interactive");
        } catch(e){
          // IE
        }
    }
}

class LandmarkOptions {
    constructor(drawTool, features, saveFeature, deleteFeature, renderCallback) {
        this.drawTool = drawTool;
        this.features = features;
        this.saveFeature = saveFeature;
        this.deleteFeature = deleteFeature;
        this.renderCallback = renderCallback;

        bindAll(["onSave", "onDelete", "setName", "setDescription"],
            this);

        if (this.features.length) {
            this.updateName = this.features[0].properties.name;
            this.updateDescription = this.features[0].properties.short_description || '';
        } else {
            this.updateName = null;
            this.updateDescription = null;
        }
    }
    // setName / setDescription: remember but don't yet save to map and localStorage
    setName(name) {
        this.updateName = name;
        this.onSave();
    }
    setDescription(description) {
        this.updateDescription = description;
        this.onSave();
    }
    onSave() {
        // save name, description, and location on map and localStorage
        let updateFeature = this.features[this.selectFeature];
        updateFeature.properties.name = this.updateName;
        updateFeature.properties.short_description = this.updateDescription;
        this.saveFeature(updateFeature.id);
    }
    onDelete() {
        // delete currently viewed shape
        let deleteID = this.features[this.selectFeature].id;
        this.deleteFeature(deleteID);
    }
    render() {
        const properties = this.features.map(feature => feature.properties);

        return html`
    <div class="ui-option">
        <legend class="ui-label ui-label--row">Important Places</legend>
        ${toggle(
            "Show places",
            this.drawTool.visible,
            this.drawTool.handleToggle
        )}
    </div>
    <ul class="landmark-list">
        ${properties.map((p, idx) => html`
          <li>
            <span class="marker-name">${p.name}</span>
            <button class="marker-expand" @click="${() => {
                document.querySelectorAll(".marker-form").forEach((m, idx2) => {
                  m.style.display = (idx === idx2) ? "block" : "none"
                })
                document.querySelectorAll(".marker-expand").forEach((m, idx2) => {
                  m.style.display = (idx === idx2) ? "none" : "inline-block"
                })
            }}"> + </button>
            <div class="marker-form" style="display: none">
              <label>Edit marker:</label>
              <input
                class="text-input"
                type="text"
                placeholder="Name"
                value="${p.name}"
                autofill="off"
                autocomplete="off"
              />
              <textarea
                class="text-input"
                placeholder="Description"
                autofill="off"
                autocomplete="off"
              >${p.description}</textarea>
              <div>
                <button @click="${(e) => {
                  document.querySelectorAll(".marker-form")[idx].style.display = "none";
                  document.querySelectorAll(".marker-expand")[idx].style.display = "inline-block";
                }}">Close</button>
                <button @click="${(e) => {
                  const form = e.target.parentElement.parentElement;
                  this.selectFeature = idx;
                  this.setName(form.children[1].value);
                  this.setDescription(form.children[2].value);
                  this.onSave();
                }}">Save</button>
              </div>
            </div>
          </li>
        `)}
        <li>
          <button
            @click="${() => {
              document.querySelectorAll(".marker-form").forEach((m, idx2) => {
                m.style.display = "none";
              })
              document.querySelectorAll(".marker-expand").forEach((m, idx2) => {
                m.style.display = "inline-block";
              })
              document.querySelector(".mapboxgl-control-container .mapbox-gl-draw_point").click()
            }}"
          >
            New Marker
          </button>
          - then click place on map
        </li>
    </ul>`;
    }
}
