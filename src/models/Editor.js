import UIStateStore from "./UIStateStore";
import reducer from "../reducers";
import Toolbar from "../components/Toolbar/Toolbar";
import { render } from "lit-html";

export default class Editor {
    constructor(state, plugins) {
        this.state = state;
        this.store = new UIStateStore(reducer, {
            toolbar: { activeTab: "criteria" },
            elections: {
                activeElectionIndex: 0
            },
            charts: {
                population: { isOpen: true },
                racialBalance: {
                    isOpen: true,
                    activeSubgroupIndices: state.population.indicesOfMajorSubgroups()
                },
                electionResults: { isOpen: false },
                vapBalance: {
                    isOpen: false,
                    activeSubgroupIndices: state.vap
                        ? state.vap.indicesOfMajorSubgroups()
                        : null
                }
            }
        });
        this.toolbar = new Toolbar(this.store);
        for (let plugin of plugins) {
            plugin(this);
        }

        this.render = this.render.bind(this);

        this.store.subscribe(this.render);
        this.state.subscribe(this.render);
    }
    render() {
        const target = document.getElementById("toolbar");
        if (target === null) {
            return;
        }
        render(this.toolbar.render(), target);
    }
}
