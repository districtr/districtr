import { html } from "lit-html";

export default class Tool {
    constructor(id, name, icon, hideMe) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.active = false;
        this.hideMe = hideMe; // for GJ landmarks on districting mode
    }
    activate() {
        this.active = true;
        try {
            document.getElementById(`tool-${this.id}`).checked = true;
        } catch(e) { }
    }
    deactivate() {
        this.active = false;
    }
    render(selectTool) {
        return this.hideMe ? ""
          : html`
            <div class="icon-list__item" title="${this.name}">
                <label>${this.name}</label>
                <input
                    type="radio"
                    id="tool-${this.id}"
                    name="tool"
                    value="${this.id}"
                    @change=${() => selectTool(this.id)}
                    ?checked=${this.active}
                />
                <div class="icon-list__item__radio"></div>
                ${this.icon}
            </div>
        `;
    }
}
