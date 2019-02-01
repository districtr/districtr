import { html } from "lit-html";

export default class Tool {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.active = false;
    }
    activate() {
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }
    render(selectTool) {
        return html`
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
