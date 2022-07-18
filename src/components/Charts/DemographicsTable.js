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
  if (value >= 1000000) {
    return Math.round(value / 100000) / 10 + "M";
  } else if (value >= 100000) {
    return Math.round(value / 1000) + "k";
  } else if (value >= 10000) {
    return Math.round(value / 100) / 10 + "k";
  } else {
    return value.toLocaleString();
  }
}

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return (document.body.className === "nycmode")
      ? `background: #ccc; color: transparent;`
      : `background: ${background}; color: ${color}`;
}

function getCell(subgroup, part, width, decimals) {
    const value =
        part !== null
            ? subgroup.getFractionInPart(part.id)
            : subgroup.sum / subgroup.total.sum;
    return {
        content: decimals === "population"
            ? popNumber(part === null ? subgroup.sum : subgroup.getSum(part.id))
            : `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: getCellStyle(value) + `; width: ${width}`
    };
}

export default (subgroups, parts, decimals=true) => {
    const width = `${Math.round(81 / subgroups.length)}%`;
    const headers = subgroups.map(subgroup => subgroup.getAbbreviation());
    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getCell(subgroup, part, width, decimals))
    }));
    rows.push({
        label: "Overall",
        entries: subgroups.map(subgroup => getCell(subgroup, null, width, decimals))
    });
    return DataTable(headers, rows);
};
