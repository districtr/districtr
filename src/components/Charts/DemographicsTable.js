import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

import spanish from "../../l10n/es";
const i18n = spanish.spanish;

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

function getCell(subgroup, part, width) {
    const value =
        part !== null
            ? subgroup.getFractionInPart(part.id)
            : subgroup.sum / subgroup.total.sum;
    return {
        content: `${roundToDecimal(value * 100, 1)}%`,
        style: getCellStyle(value) + `; width: ${width}`
    };
}

export default (subgroups, parts) => {
    const width = `${Math.round(81 / subgroups.length)}%`;
    const headers = subgroups.map(subgroup => subgroup.getAbbreviation());
    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getCell(subgroup, part, width))
    }));
    rows.push({
        label: i18n.editor.evaluation.overall,
        entries: subgroups.map(subgroup => getCell(subgroup, null, width))
    });
    return DataTable(headers, rows);
};
