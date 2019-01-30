import { html } from "lit-html";
import { actions } from "../reducers/subgroups";
import DemographicsTable from "./Charts/DemographicsTable";
import Parameter from "./Parameter";
import select from "./select";

function selectBoxes(subgroups, activeSubgroupIndices, dispatch) {
    const labels = ["Compare", "with"];
    return activeSubgroupIndices.map((index, j) =>
        Parameter({
            label: labels[j] || "and",
            element: select(
                `subgroups-${j}`,
                subgroups,
                i =>
                    dispatch(
                        actions.selectSubgroup({
                            subgroupIndex: i,
                            subgroupPosition: j
                        })
                    ),
                index
            )
        })
    );
}

export default class RaceTab {
    constructor(id, name, population, parts) {
        this.id = id;
        this.name = name;
        this.population = population;
        this.parts = parts;

        this.render = this.render.bind(this);
    }
    render(state, dispatch) {
        const subgroups = state.subgroups.activeSubgroupIndices.map(
            index => this.population.subgroups[index]
        );
        return html`
            <section class="toolbar-section" id="${this.id}">
                <h4>Racial Balance</h4>
                ${
                    selectBoxes(
                        this.population.subgroups,
                        state.subgroups.activeSubgroupIndices,
                        dispatch
                    )
                }
                ${DemographicsTable(subgroups, this.parts)}
            </section>
        `;
    }
}
