import { html } from "lit-html";

const template = (tabs, activeTab, onChange) => {
    if (tabs.length <= 1) {
        return html``;
    }
    return html`
        <ul class="tabs">
            ${
                tabs.map(
                    tab => html`
                        <li>
                            <input
                                type="radio"
                                name="tabs"
                                value="${tab.id}"
                                ?checked="${tab.id == activeTab}"
                                @input="${() => onChange(tab.id)}"
                            />
                            <div class="tabs__tab">${tab.name}</div>
                        </li>
                    `
                )
            }
        </ul>
    `;
};

export default class Tabs {
    constructor(tabs, renderCallback) {
        this.tabs = tabs;
        this.render = this.render.bind(this);
        this.onChange = this.onChange.bind(this);
        this.activeTab = tabs.length > 0 ? tabs[0].id : null;
        this.renderCallback = renderCallback;
    }
    onChange(id) {
        this.activeTab = id;
        this.renderCallback();
    }
    render() {
        return html`
            ${template(this.tabs, this.activeTab, this.onChange)}
            ${
                this.tabs.map(
                    tab => html`
                        <div
                            class="tab__body ${
                                tab.id == this.activeTab ? "active" : ""
                            }"
                        >
                            ${tab.render()}
                        </div>
                    `
                )
            }
        `;
    }
}
