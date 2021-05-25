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
    return `background: ${background}; color: ${color}; text-align: center;`;
}

function getCell(subgroup, part, width, decimals) {
    const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: getCellStyle(value) + `; width: ${width}`
    };
}

function getTable(subgroups, parts, decimals=true) {
    const width = `${Math.round(81 / subgroups.length)}%`;
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
    loading,
    placeId,
    state,
    dispatch
) {
    const def_values = parts.reduce((o, part) => Object.assign(o, {[part.id]: 0}), {});
    const groups = Object.keys(effectiveness);

    const separateAlignment = ["ma_vra"].includes(placeId);

    const subgroups = separateAlignment 
        ? groups.map(g => {
                const part_scores = effectiveness[g] ? Object.fromEntries(Object.entries(effectiveness[g]).map(([k, v]) => [k, v.Score])) : {};
                const part_cvaps = effectiveness[g] ? Object.fromEntries(Object.entries(effectiveness[g]).map(([k, v]) => [k, v.CVAPShare])) : {};
                const e_scores = {...def_values, ...part_scores};
                const e_cvaps = {...def_values, ...part_cvaps}
                return [{"name": g + " Eff.", "values": pid => e_scores[pid]}, {"name": g + " CVAP %", "values": pid => e_cvaps[pid]}];
            }).flat()
         : groups.map(g => {
                    const part_scores = effectiveness[g] ? Object.fromEntries(Object.entries(effectiveness[g]).map(([k, v]) => [k, v.Score])) : {};
                    const e_scores = {...def_values, ...part_scores};
                    return {"name": g + " Electoral Effectiveness", "values": pid => e_scores[pid]};
                });

    return html`
        <ul class="option-list">
            <li class="option-list__item">
            <span style="align-items: center;display: inline-flex;">
            ${loading ? html`<img src="/assets/pinwheel2.gif" width="20px" height="20px"> &nbsp;&nbsp;&nbsp; Calculating` : html`Synced with current map`}
            </span>
            </li>
        </ul>
        
        <section class="toolbar-section">
            ${getTable(subgroups, parts)}
        </section>
    `;
}

// export function VRAAlignmentTable(
//     parts,
//     effectiveness,
//     loading,
//     state,
//     dispatch
// ){
//      const def_values = parts.reduce((o, part) => Object.assign(o, {[part.id]: 0}), {});
//      const groups = Object.keys(effectiveness);
 
//      const subgroups = groups.map(g => {
//          const part_scores = effectiveness[g] ? Object.fromEntries(Object.entries(effectiveness[g]).map(([k, v]) => [k, v.GroupControl])) : {};
//          const e_scores = {...def_values, ...part_scores};
//          return {"name": g + " Group Control", "values": pid => e_scores[pid]};
//          });
//      return html`
//          <ul class="option-list">
//              <li class="option-list__item">
//              <span style="align-items: center;display: inline-flex;">
//              ${loading ? html`<img src="/assets/pinwheel2.gif" width="20px" height="20px"> &nbsp;&nbsp;&nbsp; Calculating` : html`Synced with current map`}
//              </span>
//              </li>
//          </ul>
         
//          <section class="toolbar-section">
//              ${getTable(subgroups, parts)}
//          </section>
//      `;
// }