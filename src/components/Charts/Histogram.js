import { html } from "lit-html";
import DataTable from "./DataTable";

function getColumn(subgroup, part, max, median_name) {
    let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1)),
        width = Math.round(years * 2.5),
        height = Math.ceil(((subgroup.data[part.id] || 1) / (max || 1000000000)) / width * 125),
        is_median = (subgroup.name === median_name);
    return {
      content: html`<div style="background:${is_median ? "#888" : "#444"};width:${width}px; height:${height}px"></div>`,
      style: ""
    }
}

export default (subgroups, parts) => {
    subgroups = subgroups.sort((a, b) => a.name.replace("<", "").replace("+", "").split("-")[0] * 1 - b.name.replace("<", "").replace("+", "").split("-")[0] * 1);

    // scale for chart
    let max = {}, median = {};
    parts.forEach((part) => {
      let median_point = (subgroups[0].total.data[part.id] || 0) / 2;

      subgroups.forEach((subgroup, index) => {
        if (!index) {
          // youngest
          subgroup.age_range = [0, subgroup.name.replace("<", "") * 1];
        } else if (index === subgroups.length - 1) {
          // oldest
          subgroup.age_range = [subgroup.name.replace("+", "") * 1, subgroup.name.replace("+", "") * 1 + 5];
        } else {
          subgroup.age_range = subgroup.name.split("-").map(n => n * 1);
        }
        if (median_point) {
          median_point -= (subgroup.data[part.id] || 0);
          if (median_point <= 0) {
            median_point = 0;
            median[part.id] = subgroup.name;
          }
        }

        let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1));
        max[part.id] = Math.max(max[part.id] || 0, subgroup.data[part.id] / years);
      });
    });

    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getColumn(subgroup, part, max[part.id], median[part.id]))
            .concat([{
                content: median[part.id] ? html`Median:<br/>${median[part.id]}` : "",
                style: ""
            }])
    }));
    return html`<div class="parameter"><strong>Youngest to Oldest</strong></div>
    <br/>
    <div class="age-histogram">
      ${DataTable(new Array(subgroups.length), rows)}
    </div>`;
};
