import { html } from "lit-html";
import DataTable from "./DataTable";

const fmtIncome = (label, oneline) => {
   if (label.indexOf("in_") === 0) {
      if (label.includes("gt")) {
          return "> " + label.split("_")[2] + "k";
      } else {
          return "$" + label.split("_")[1] + "-" + (oneline ? "" : " ") + label.split("_")[2] + "k";
      }
   }
   return label;
};

function getColumn(subgroup, part, max, median_name, isAge, widthMultiplier) {
    let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1)),
        width = Math.round(years * (isAge ? 2 : 44)) * widthMultiplier,
        height = Math.ceil(((subgroup.data[part.id] || 1) / (max || 1000000000)) / width * (isAge ? 125 : 2100)),
        is_median = (subgroup.name === median_name);
    return {
      content: html`<div style="background:${is_median ? "#888" : "#444"};width:${width}px; height:${height}px"></div>`,
      style: ""
    }
}

export default (subgroups, parts, isAge, widthMultiplier) => {
    if (isAge) {
        subgroups = [].concat(subgroups.sort((a, b) => {
          return a.name.replace("<5", "4").replace("+", "").split("-")[0] * 1 - b.name.replace("<5", "4").replace("+", "").split("-")[0] * 1
        }).filter(c => c.name.indexOf("Median")));
        if (subgroups[subgroups.length - 1].name !== '85+') {
            subgroups.push({
              name: '85+',
              data: []
            })
        }
    } else {
        // clone and sort income sgs
        // don't include Median Income ($) compared to other income columns (# of households)
        subgroups = [].concat(subgroups.sort((a, b) => {
           return a.key < b.key ? -1 : 1
        }).filter(c => c.name.indexOf("Median")));
    }

    // scale for chart
    let max = {}, median = {};
    parts.forEach((part) => {
      let tot_pop = (subgroups[0].total.data[part.id] || 0),
          median_point = tot_pop / 2;

      // todo : fix weird issue where total is set to NaN or 0; removing median
      if (isAge && !tot_pop) {
          subgroups.forEach((subgroup) => {
              tot_pop += (subgroup.data[part.id] || 0);
          });
          median_point = tot_pop / 2;
      }

      subgroups.forEach((subgroup, index) => {
        tot_pop -= (subgroup.data[part.id] || 0);

        if (isAge) {
          if (!index) {
            // youngest
            subgroup.age_range = [0, subgroup.name.replace("<", "") * 1];
          } else if (index === subgroups.length - 1) {
            // oldest
            subgroup.age_range = [subgroup.name.replace("+", "") * 1, subgroup.name.replace("+", "") * 1 + 5];
          } else {
            subgroup.age_range = subgroup.name.split("-").map(n => n * 1);
          }
        } else {
          subgroup.age_range = [1]
        }
        if (median_point) {
          median_point -= (subgroup.data[part.id] || 0);
          if (median_point <= 0) {
            median_point = 0;
            median[part.id] = subgroup.name;
          }
        }

        let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1))
        max[part.id] = Math.max(max[part.id] || 0, (subgroup.data[part.id] / years) || 0);
      });

      if (isAge) {
        // adds final age level (85+)
        // need to also fix this for income per household
        subgroups[subgroups.length - 1].data[part.id] = (tot_pop || 0); // remaining population
        max[part.id] = Math.max(max[part.id], (tot_pop || 0));
      }
    });

    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getColumn(subgroup, part, max[part.id], median[part.id], isAge, widthMultiplier))
            .concat([{
                content: median[part.id] ? html`Median:<br/>${fmtIncome(median[part.id], true)}` : "",
            }]
        )
    }));
    if (!isAge) {
        // income headers
        rows = [{
            entries: subgroups.map(sg => {
                return { content: html`<div style="width:44px">${fmtIncome(sg.key)}</div>` }
            }).concat([{ content: "" }])
        }].concat(rows);
    }

    return html`
    <div class="age-histogram">
      ${DataTable(new Array(subgroups.length), rows)}
    </div>`;
};
