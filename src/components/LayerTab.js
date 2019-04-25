import { html } from "lit-html";
import { Tab } from "./Tab";

export default class LayerTab extends Tab {
    render(uiState, dispatch) {
        return html`
            <section class="toolbar-section layer-list">
                ${this.sections.map(
                    item => html`
                        <div class="layer-list__item">
                            ${item(uiState, dispatch)}
                        </div>
                    `
                )}
            </section>
        `;
    }
}
