import { html } from "lit-html";
import { actions } from "../reducers/charts";
import RevealSection from "./RevealSection";

export class Tab {
    constructor(id, name, store) {
        this.id = id;
        this.name = name;
        this.sections = [];
        this.store = store;
    }
    addSection(element) {
        if (name) {
            this.store.dispatch(
                actions.addChart({ chart: name })
            );
        }
        this.sections.push(element);
    }
    addRevealSection(name, element, options) {
        if (options === undefined || options === null) {
            options = {};
        }
        this.store.dispatch(
            actions.addChart({ chart: name, isOpen: true, ...options })
        );
        this.sections.push(
            (uiState, dispatch) => html`
                <section class="toolbar-section">
                    ${RevealSection(
                        name,
                        element(uiState, dispatch),
                        uiState.charts[name].isOpen,
                        () => dispatch(actions.toggleOpen({ chart: name }))
                    )}
                </section>
            `
        );
    }
    render(uiState, dispatch) {
        return this.sections.map(section => section(uiState, dispatch));
    }
}
