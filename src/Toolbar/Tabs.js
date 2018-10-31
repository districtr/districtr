import { html } from "lit-html";

const template = (tabs, onChange) => html`
    <ul class="tabs">
        ${tabs.map(
            tab => html`
        <li>
            <input
                type="radio"
                name="tabs"
                value="${tab.id}"
                ?checked=${tab.checked}
                @input=${onChange}>
            <div class="tabs__tab">
            ${tab.name}
            </div>
        </li>
        `
        )}
    </ul>`;

// TODO: Use just CSS for hide/show

export default class Tabs {
    constructor(tabs) {
        this.tabs = tabs;
        this.onChange = this.onChange.bind(this);
    }
    onChange(e) {
        const activeTabId = e.target.value;
        this.tabs.forEach(tab => {
            let tabBody = document.getElementById(tab.id);
            if (tabBody !== null) {
                tabBody.style.display = tab.id === activeTabId ? null : "none";
            }
        });
    }
    render() {
        return template(this.tabs, this.onChange);
    }
}
