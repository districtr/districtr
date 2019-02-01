import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { repeat } from "lit-html/directives/repeat";
import { actions } from "../reducers/tabs";

const tabs = (tabs, activeTab, onChange) => {
    if (tabs.length <= 1) {
        return html``;
    }
    return html`
        <ul class="tabs">
            ${tabs.map(
                tab => html`
                    <li>
                        <input
                            type="radio"
                            name="tabs"
                            value="${tab.id}"
                            ?checked="${tab.id == activeTab}"
                            @change="${() => onChange({ id: tab.id })}"
                        />
                        <div class="tabs__tab">${tab.name}</div>
                    </li>
                `
            )}
        </ul>
    `;
};

export default function Tabs(tabComponents, state, dispatch) {
    return html`
        ${tabs(tabComponents, state.tabs.activeTab, info =>
            dispatch(actions.changeTab(info))
        )}
        ${repeat(
            tabComponents,
            tab => tab.id,
            tab => html`
                <div
                    class=${classMap({
                        tab__body: true,
                        active: tab.id === state.tabs.activeTab
                    })}
                >
                    ${tab.render(state, dispatch)}
                </div>
            `
        )}
    `;
}
