import { html } from "lit-html";
import { actions } from "../../reducers/subgroups";
import Parameter from "../Parameter";
import select from "../select";
import DemographicsTable from "./DemographicsTable";

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

export default function RacialBalanceTable(
    population,
    parts,
    uiState,
    dispatch
) {
    const subgroups = uiState.subgroups.activeSubgroupIndices.map(
        index => population.subgroups[index]
    );
    return html`
        <section class="toolbar-section">
            ${selectBoxes(
                population.subgroups,
                uiState.subgroups.activeSubgroupIndices,
                dispatch
            )}
            ${DemographicsTable(subgroups, parts)}
        </section>
    `;
}
