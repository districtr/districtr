import { roundToDecimal, numberWithCommas } from "../../utils";
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

function getCellStyle(value) {
    const background = getBackgroundColor(value);
    const color = value > 0.4 ? "white" : "black";
    return `background: ${background}; color: ${color}; width: 50%;`;
}

function getCell(value) {
    return {
        content: `${roundToDecimal(value * 100, 1)}%`,
        style: getCellStyle(value)
    };
}

function getEntries(subgroup, part) {
    const districtFraction = subgroup.getFractionInPart(part.id);
    const overallFraction = subgroup.sum / subgroup.total.sum;
    return [getCell(districtFraction), getCell(overallFraction)];
}

export default (columnSet, placeName, communityName, part) => {
    if (!part) {
        part = { id: 0 };
    }
    const subgroups = columnSet.subgroups;
    const headers = [communityName || "Your Community", placeName];
    let rows = [
        {
            label: "Total",
            entries: [
                {
                    content: numberWithCommas(columnSet.total.data[part.id]),
                    style: "width: 40%"
                },
                {
                    content: numberWithCommas(columnSet.total.sum),
                    style: "width: 40%"
                }
            ]
        }
    ];
    rows.push(
        ...subgroups.map(subgroup => ({
            label: subgroup.getAbbreviation(),
            entries: getEntries(subgroup, part)
        }))
    );

    return DataTable(headers, rows);
};
