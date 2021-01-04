import { html } from "lit-html";
import { actions } from "../../reducers/charts";
import Select from "../Select";
import Parameter from "../Parameter";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

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

function getCell(value, width, decimals) {
    // const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: getCellStyle(value) + `; width: ${width}`
    };
}

function getTextCell(value, width) {
    return {
        content: `${value.split("D_")[0]}`,
        style: `background: white; color: black; width: ${width}`
    };
}

function getTable(elects, decimals=true) {
    const headers = ["Group Control", "CoC", "Primary Support"]; //subgroups.map(subgroup => subgroup.name);
    const width = `${Math.round(81 / headers.length)}%`;
    let rows = elects.map(elect => ({
        label: elect.name,
        entries: [getCell(elect.GroupControl, width, decimals), getTextCell(elect.CoC, width), getCell(elect.CoC_res, width, decimals)]
    }));
    return DataTable(headers, rows);
}

function DistrictResults(effectiveness, dist) {
    return html`
        <div class="ui-option ui-option--slim">
            <h5>Historical Election Breakdown</h5>
        </div>
        <section class="toolbar-section">
            ${effectiveness[dist.id] ? getTable(effectiveness[dist.id].electionDetails) : ""}
        </section>
    `;
}

function SelectDist(dists, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${dists.map(
                (d, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${d.displayNumber}</option
                    >
                `
            )}
        </select>
    `;
}

export default function VRAResultsSection(
    chartID,
    parts,
    effectiveness,
    uiState,
    dispatch
) {
    // console.log(effectiveness);
    console.log(parts);
    return html`
        <section class="toolbar-section">
            ${Parameter({
                label: "District:",
                element: SelectDist(parts, i =>
                    dispatch(
                        actions.selectPart({
                            chart: chartID,
                            partIndex: i
                        })
                    ),
                )
            })}
            ${DistrictResults(
                effectiveness,
                parts[uiState.charts[chartID].activePartIndex]
            )}
        </section>
    `;
}