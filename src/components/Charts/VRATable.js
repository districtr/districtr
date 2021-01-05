import { html } from "lit-html";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";
import { actions } from "../../reducers/charts";
import Parameter from "../Parameter";
import Select from "../Select";

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

function getCell(subgroup, part, width, decimals) {
    const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: getCellStyle(value) + `; width: ${width}`
    };
}

function getTable(subgroups, parts, decimals=true) {
    const width = `${Math.round(61 / subgroups.length)}%`;
    const headers = subgroups.map(subgroup => subgroup.name);
    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: subgroups.map(subgroup => getCell(subgroup, part, width, decimals))
    }));
    return DataTable(headers, rows);
}

export default function VRAEffectivenessTable(
    parts,
    effectiveness,
    state,
    dispatch
) {
    const def_values = parts.reduce((o, part) => Object.assign(o, {[part.id]: [0,0]}), {});
    const part_scores = Object.fromEntries(Object.entries(effectiveness).map(([k, v]) => [k, v.score]));

    const e_scores = {...def_values, ...part_scores};
    // console.log(e_scores)

    const subgroups = [{"name": "Black Effectiveness Score", "values": pid => e_scores[pid][0]}]
    return html`
        <section class="toolbar-section">
            ${getTable(subgroups, parts)}
        </section>
    `;
}