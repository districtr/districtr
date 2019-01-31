import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

function getPercent(subgroup, i) {
    const total = subgroup.total.tally.data[i];
    return total > 0 ? subgroup.tally.data[i] / total : 0;
}

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

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}`;
}

export default (subgroups, parts) => {
    const width = `${Math.round(90 / subgroups.length)}%`;
    return DataTable(
        subgroups,
        parts,
        subgroup => subgroup.name.split(" ")[0],
        value => getCellStyle(value) + `; width: ${width}`,
        getPercent,
        percent => roundToDecimal(percent * 100, 1)
    );
};
