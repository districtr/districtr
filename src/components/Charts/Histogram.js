import { html } from "lit-html";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

/**
 * We want the background color to be #f9f9f9 when value = 0, and black when
 * the value = 1. #f9f9f9 is the same as rgba(0, 0, 0, 0.02), so we map the 0-to-1
 * value scale to the 0.02-to-1 alpha scale.
 * @param {number} value - the subgroup's share of the district's population
 *  (between 0 and 1)
 */
function getBackgroundColor(value) {
    return `rgba(0, 0, 0, ${Math.min(
        roundToDecimal(Math.max(value, 0) * 0.98 + 0.02, 2),
        1
    )})`;
}

function popNumber(value) {
  if (value >= 10000) {
    return Math.round(value / 100) / 10 + "k";
  } else {
    return value.toLocaleString();
  }
}

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}`;
}

function getColumn(subgroup, part, max) {
    let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1)),
        width = Math.round(years * 2.75),
        height = Math.ceil(((subgroup.data[part.id] || 1) / (max || 1000000)) / width * 150);
    return {
      content: html`<div style="background:#444;width:${width}px; height:${height}px"></div>`,
      style: ""
    }
}

export default (subgroups, parts) => {
    subgroups = subgroups.sort((a, b) => a.name.replace("<", "").split("-")[0] * 1 - b.name.replace("<", "").split("-")[0] * 1);

    // scale for chart
    let max = {};
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

      parts.forEach((part) => {
        let years = (subgroup.age_range.length === 1 ? 1 : (subgroup.age_range[1] - subgroup.age_range[0] + 1));
        max[part.id] = Math.max(max[part.id] || 0, subgroup.data[part.id] / years);
      });
    });

    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getColumn(subgroup, part, max[part.id]))
    }));
    return html`<div class="parameter"><strong>Youngest to Oldest</strong></div>
    <br/>
    <div class="age-histogram">
      ${DataTable(new Array(subgroups.length), rows)}
    </div>`;
};
