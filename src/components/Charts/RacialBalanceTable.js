import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import select from "../select";
import DemographicsTable from "./DemographicsTable";

function selectBoxes(subgroups, activeSubgroupIndices, onChange) {
    const labels = ["Compare", "with"];
    return activeSubgroupIndices.map((index, j) =>
        Parameter({
            label: labels[j] || "and",
            element: select(`subgroups-${j}`, subgroups, onChange(j), index)
        })
    );
}

export default function RacialBalanceTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    const subgroups = chartState.activeSubgroupIndices.map(
        index => population.subgroups[index]
    );
    return html`
        <section class="toolbar-section">
            ${selectBoxes(
                population.subgroups,
                chartState.activeSubgroupIndices,
                j => i =>
                    dispatch(
                        actions.selectSubgroup({
                            chart: chartId,
                            subgroupIndex: i,
                            subgroupPosition: j
                        })
                    ),

                dispatch
            )}
            ${DemographicsTable(subgroups, parts)}
        </section>
    `;
}
