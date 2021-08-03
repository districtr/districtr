import { roundToDecimal, numberWithCommas } from "../../utils";
import DataTable from "./DataTable";
import { html } from "lit-html";
import Select from "../Select";
import Parameter from "../Parameter";
import { toggle } from "../Toggle";
import { actions } from "../../reducers/charts";
import { generateId } from "../../utils";
import Layer, { addBelowLabels } from "../../map/Layer";

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

function getTotal(value) {
    return {
        content: value.toLocaleString(),
        style: getCellStyle(value)
    };
}

function getEntries(subgroup, part) {
    const districtFraction = subgroup.getFractionInPart(part.id);
    const overallFraction = subgroup.sum / subgroup.total.sum;
    return [part === "" ? getTotal(subgroup.sum) : getCell(districtFraction), getCell(overallFraction)];
}

export function DistrictEvaluationTable(columnSet, placeName, part) {
    if (!part && part !== "") {
        part = [{ id: 0 }];
    }
    const subgroups = columnSet.subgroups;
    const headers = part ? [part.name || part.renderLabel(), placeName] : [placeName];
    let entries = [];
    if (part) {
        entries.push({
            content: numberWithCommas(columnSet.total.data[part.id]),
            style: "width: 40%"
        });
    }
    entries.push({
        content: numberWithCommas(Math.round(columnSet.total.sum)),
        style: "width: 40%"
    });
    let rows = [
        {
            label: "Total",
            entries: entries
        }
    ];
    rows.push(
        ...subgroups.map(subgroup => ({
            label: subgroup.getAbbreviation(),
            entries: getEntries(subgroup, part)
        }))
    );

    return DataTable(headers, rows);
}

export default DistrictEvaluationTable;

export const CoalitionPivotTable = (chartId, columnSet, placeName, parts, units, totalOnly, districtView) => (
    uiState,
    dispatch
) => {
    const visibleParts = parts.filter(part => part.visible);
    let fullsum = 0,
        mockData = [],
        selectSGs = columnSet.subgroups.filter(sg => window.coalitionGroups[sg.key]);
    selectSGs.forEach(sg => {
        fullsum += sg.sum;
        sg.data.forEach((val, idx) => mockData[idx] = (mockData[idx] || 0) + val);
    });
    let coalitionSubgroup = {
        data: mockData,
        key: 'coal',
        name: (selectSGs.length > 1 ? 'Coalition' : (selectSGs[0] || {name: 'None'}).name),
        getAbbreviation: () => "Coalition",
        getFractionInPart: (p) => {
            let portion = 0;
            selectSGs.forEach((selected) => {
                portion += selected.getFractionInPart(p);
            });
            return portion;
        },
        sum: Math.round(fullsum),
        total: columnSet.subgroups.length > 0 ? columnSet.subgroups[0].total : 0
    };

    let mockColumnSet = {
      ...columnSet,
      subgroups: [coalitionSubgroup]
    };

    // support nameless districts and communities
    visibleParts.forEach((p, i) => p.name = p.name || ("District " + (i + 1)));

    return html`
        <section class="toolbar-section coalition-table" style=${{ padding: totalOnly ? 0 : 10 }}>
            ${!totalOnly && visibleParts.length > 1
                ? Parameter({
                      label: (districtView ? "District:" : "Community:"),
                      element: Select(visibleParts, i =>
                          dispatch(
                              actions.selectPart({
                                  chart: chartId,
                                  partIndex: i
                              })
                          )
                      )
                  })
                : ""}
            ${DistrictEvaluationTable(
                mockColumnSet,
                placeName,
                totalOnly ? "" : parts[uiState.charts[chartId].activePartIndex]
            )}
        </section>
    `;
};
