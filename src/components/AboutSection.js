import { html } from "lit-html";
import Parameter from "./Parameter";
import Select from "./Select";
import { savePlanToStorage } from "../routes";
import { bindAll } from "../utils";
import { colorScheme } from "../colors";

export default class AboutSection {
    constructor({ state, render }) {
        this.part = state.parts[0];
        this.name = this.part.name || "";
        this.description = this.part.description || "";
        this.state = state;
        this.renderCallback = render;
        this.saved = false;
        bindAll(
            ["onSave", "setName", "setDescription", "render", "setPart"],
            this
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
    render() {
        const parts = this.state.activeParts;
        return html`
            <ul class="option-list">
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
                />
            </li>
            <li class="option-list__item">
                <label class="ui-label">Describe Your Community</label>
                <textarea
                    class="text-input text-area"
                    @input=${e => setDescription(e.target.value)}
                    .value="${description}"
                ></textarea>
                <br/>
                <code>Your community details are saved automatically</code>
            </li>
        </ul>
    `;
}
