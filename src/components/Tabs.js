import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { repeat } from "lit-html/directives/repeat";

const tabs = (tabs, activeTab, onChange) => {
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

const changeTab = dispatch => id => {
    dispatch({ type: "changeTab", id });
};

export default function Tabs(tabComponents, { activeTab }, dispatch) {
    return html`
        ${tabs(tabComponents, activeTab, changeTab(dispatch))}
        ${
            repeat(
                tabComponents,
                tab => tab.id,
                tab => html`
                    <div
                        class=${
                            classMap({
                                tab__body: true,
                                active: tab.id === activeTab
                            })
                        }
                    >
                        ${tab.render(dispatch)}
                    </div>
                `
            )
        }
    `;
}
