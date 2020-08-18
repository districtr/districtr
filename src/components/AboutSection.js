import { html } from "lit-html";
import Parameter from "./Parameter";
import Select from "./Select";
import { savePlanToStorage } from "../routes";
import { bindAll } from "../utils";
import { colorScheme } from "../colors";
import { Landmarks } from "./Landmark";
import { LandmarkOptions } from "./Toolbar/LandmarkTool";

export default class AboutSection {
    constructor({ state, render }) {
        this.part = state.parts[0];
        this.name = this.part.name || "";
        this.description = this.part.description || "";
        this.state = state;
        this.renderCallback = render;
        this.saved = false;

        this.updateLandmarkList = this.updateLandmarkList.bind(this);

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
        this.landmarks.handleDrawToggle(true);

        bindAll(
            ["onSave", "setName", "setDescription", "render", "setPart", "saveFeature", "deleteFeature"],
            this
        );

        this.options = new LandmarkOptions(
            this.landmarks,
            lm.data.features,
            this.saveFeature,
            this.deleteFeature,
            this.renderCallback
        );
    }
    setPart(index) {
        if (this.state.parts[index].visible !== true) {
            return;
        }
        this.part = this.state.parts[index];
        this.name = this.part.name || "";
        this.description = this.part.description || "";
        document.getElementsByClassName('custom-select')[0].classList.toggle('open');
        this.renderCallback();
    }
    setName(name) {
        this.name = name;
        this.onSave();
    }
    setDescription(description) {
        this.description = description;
        this.onSave();
    }
    onSave() {
        this.part.updateDescription({
            name: this.name,
            description: this.description
        });
        savePlanToStorage(this.state.serialize());
        this.saved = true;
        this.renderCallback();
    }
    updateLandmarkList(selectLastFeature) {
        savePlanToStorage(this.state.serialize());
        if (selectLastFeature) {
            this.options.handleSelectFeature(-1);
            // TODO: update UI
            // handleSelectFeature calls render
        } else {
            this.renderCallback();
        }
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
    render() {
        const parts = this.state.activeParts;
        return html`
            <ul class="option-list">
                <li class="option-list__item landmarks">
                    ${this.options.render()}
                    <button @click="${e => {
                        document.getElementById("tool-pan").click();
                        document.getElementsByClassName("mapbox-gl-draw_point")[0].click();
                    }}">Add a Landmark</button>
                </li>
                <li class="option-list__item">
                    ${parts.length > 1
                        ? Parameter({
                              label: "Community:",
                              element: html`<div class="custom-select-wrapper">
                                      <div class="custom-select">
                                          <div
                                              class="custom-select__trigger"
                                              @click="${(e) => { document.getElementsByClassName('custom-select')[0].classList.toggle('open')}}"
                                          >
                                              <span class="part-number" style="${'background:' + colorScheme[this.part.id] }"> </span>
                                              <span>${this.name}</span>
                                              <div class="arrow"></div>
                                          </div>
                                          <div class="custom-options">
                                              ${parts.map((p) => {
                                                 return html`<div @click="${e => this.setPart(p.id)}">
                                                    <span class="part-number" style="${'background:' + colorScheme[p.id] }"> </span>
                                                    <span class="custom-option" data-value="${p.name}">${p.name}</span>
                                                 </div>`;
                                              })}
                                          </div>
                                      </div>
                                  </div>`
                          })
                        : ""}
                </li>
            </ul>
            ${AboutSectionTemplate(this)}
        `;
    }
}

function AboutSectionTemplate({
    name,
    description,
    saved,
    onSave,
    setName,
    setDescription
}) {
    return html`
        <ul class="option-list">
            <li class="option-list__item">
                <label class="ui-label">Community Name</label>
                <input
                    type="text"
                    class="text-input"
                    .value="${name}"
                    @input=${e => setName(e.target.value)}
                    @blur=${e => setName(e.target.value)}
                />
            </li>
            <li class="option-list__item">
                <label class="ui-label">Describe Your Community</label>
                <textarea
                    class="text-input text-area"
                    placeholder="Write about what your community has in common, its boundaries, or recent history"
                    .value="${description}"
                    @input=${e => setDescription(e.target.value)}
                    @blur=${e => setDescription(e.target.value)}
                ></textarea>
                <br/>
                <code>Your community details are updated automatically</code>
            </li>
        </ul>
    `;
}
