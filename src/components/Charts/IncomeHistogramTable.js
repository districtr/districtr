import { html } from "lit-html";
import Histogram from "./Histogram";

export default function IncomeHistogramTable(
    chartId,
    population,
    parts,
    chartState,
    dispatch
) {
    // console.log(population.subgroups);
    let adjustGroups = [
      {name: "in_0_20", sgs: [0,1,2] },
      {name: "in_20_35", sgs: [3,4,5] },
      {name: "in_35_60", sgs: [6,7,8,9] },
      {name: "in_60_100", sgs: [10,11] },
      {name: "in_gt_100", sgs: [12,13,14,15] },
    ].map((group) => {
      let min = 0,
          max = 0,
          sum = 0,
          data = new Array(population.subgroups[0].data.length).fill(0);
      group.sgs.forEach((sg) => {
         min += population.subgroups[sg].min;
         max += population.subgroups[sg].max;
         sum += population.subgroups[sg].sum;
         data.forEach((part, i) => {
            data[i] += population.subgroups[sg].data[i];
         });
      });
      return {
        ...group,
        key: group.name,
        sum: sum,
        min: min,
        max: max,
        data: data,
        total: population.subgroups[0].total,
      }
    });

    return html`
        <section class="toolbar-section">
            ${Histogram(adjustGroups, parts, false)}
        </section>
    `;
}
