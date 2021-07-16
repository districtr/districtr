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

function message(state) {
    switch (state) {
        case "ma_vra":
            return html`<p class="italic-note">In this summary table, 
            we are reporting a raw effectiveness score from the statewide 
            elections:  using the probativity weights for the elections, 
            this simply records the weighted share of elections where the 
            candidate of choice for each racial group would have prevailed 
            in this district.  Note that the candidate of choice must win 
            in both the primary and the general to get credit for an election.
             The citizen voting age population (CVAP) comes from the most 
             recent 5-year ACS, and is shown for comparison—it is not taken 
             into account in the effectiveness score.</p>`
        case "tx_vra":
        case "la_vra":
            return html`<p class="italic-note">In this summary table, 
            we are reporting a calibrated effectiveness score.  This 
            is based on a regression that matches the raw effectiveness 
            score and the group control factor to actual recent local 
            election results. This brings the findings from statewide 
            elections better in line with local election history. You 
            should interpret these effectiveness scores as our best 
            estimate of the <strong>probability</strong> that the district 
            will perform for the candidate of choice.<p>`
    }
}


export default function VRAEffectivenessTable(
    parts,
    effectiveness,
    loading,
    placeId,
    state,
    dispatch
) {
    console.log(placeId);
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
            <li>
            ${message(placeId)}
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