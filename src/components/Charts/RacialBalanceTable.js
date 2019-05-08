import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import select from "../select";
import DemographicsTable from "./DemographicsTable";

function selectBoxes(chartId, subgroups, activeSubgroupIndices, dispatch) {
    const onChange = j => i =>
        dispatch(
            actions.selectSubgroup({
                chart: chartId,
                subgroupIndex: i,
                subgroupPosition: j
            })
        );
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
                chartId,
                population.subgroups,
                chartState.activeSubgroupIndices,
                dispatch
            )}
            ${DemographicsTable(subgroups, parts)}
        </section>
    `;
}
