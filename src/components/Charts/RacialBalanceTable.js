import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";

function SelectBoxes(chartId, subgroups, activeSubgroupIndices, dispatch) {
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
            element: Select(subgroups.map(sg => {
                return {...sg, name: sg.name.replace("voting age population", "VAP") }
            }), onChange(j), index)
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
            ${SelectBoxes(
                chartId,
                population.subgroups.filter(sg => !sg.name.includes("(2018)") && !sg.name.includes("(2019)")),
                chartState.activeSubgroupIndices,
                dispatch
            )}
            ${DemographicsTable(subgroups, parts)}
        </section>
    `;
}
