import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";
import DemographicsTable from "./DemographicsTable";

function SelectBoxes(chartId, subgroups, activeSubgroupIndices, dispatch, nonvap) {
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
                return {...sg, name: sg.name.replace("voting age population", nonvap ? "children" : "VAP") }
            }), onChange(j), index)
        })
    );
}

export default function RacialBalanceTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch,
    nonvap
) {
    let sgs = population.subgroups.filter(sg => !sg.name.includes("(2018)"));
    if (nonvap) {
       sgs = sgs.map((sg, sgdex) => {
           let abbv = sg.getAbbreviation().replace("VAP", "");
           return {
              ...sg,
              getAbbreviation: () => abbv,
              data: sg.data.map((p, index) => nonvap.subgroups[sgdex].data[index] - p),
              sum: nonvap.subgroups[sgdex].sum - sg.sum,
              total: {
                  sum: nonvap.subgroups[0].total.sum - sg.total.sum
              }
           }
       })
    }
    const subgroups = chartState.activeSubgroupIndices.map(
        index => sgs[index]
    );
    return html`
        <section class="toolbar-section">
            ${SelectBoxes(
                chartId,
                sgs,
                chartState.activeSubgroupIndices,
                dispatch,
                nonvap
            )}
            ${DemographicsTable(subgroups, parts)}
        </section>
    `;
}
