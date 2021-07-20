import UIStateStore from "./UIStateStore";
import reducer from "../reducers";
import { actions } from "../reducers/charts";
import { render, html } from "lit-html";
import RevealSection from "../components/RevealSection";

export default class Analyzer {
    constructor(state, mapState, container) {
        this.render = this.render.bind(this);
        this.mapState = mapState;
        this.container = container;
        this.state = state;

        let activeTab = "criteria";
        if (localStorage) {
            activeTab = localStorage.getItem("jsonload_viewstate") || activeTab;
            localStorage.removeItem("jsonload_viewstate");
        }

        this.store = new UIStateStore(reducer, {
            toolbar: { activeTab: activeTab, dropdownMenuOpen: false },
            elections: {
                activeElectionIndex: 0
            },
            charts: {}
        });

        this.sections = [];
        
        this.store.subscribe(this.render);
        this.state.subscribe(this.render);
    }
    
    addRevealSection(name, element, options) {
        if (options === undefined || options === null) {
            options = {}; 
        }
        this.store.dispatch(
            // default to closed
            actions.addChart({ chart: name, isOpen: false, ...options })
        );
        this.sections.push(
            (uiState, dispatch) => html`
                <section class="analyzer-section">
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

    render() {
        let result = html`
        <h2>Districting Plan Metrics</h2>
        ${this.sections.map(section => section(this.store.state, this.store.dispatch))}`
        render(result, this.container);
    }
}
