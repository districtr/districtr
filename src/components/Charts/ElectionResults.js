import { interpolateRdBu } from "d3-scale-chromatic";
import { html } from "lit-html";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";

function getCellStyle(percent, party) {
    if (party === "Democratic" && percent > 0.5) {
        return `background: ${interpolateRdBu(percent)}`;
    } else if (party === "Republican" && percent > 0.5) {
        return `background: ${interpolateRdBu(1 - percent)}`;
    }
    return `background: #f9f9f9`;
}

function getCell(election, party, part) {
    let percent = 0;
    if (part !== undefined && part !== null) {
        percent = election.percent(party, part.id);
    } else {
        percent = election.overallVoteShare(party);
    }
    return {
        content: `${roundToDecimal(percent * 100, 2)}%`,
        style: getCellStyle(percent, party)
    };
}

export default (election, parts) => {
    const headers = election.parties;
    let rows = parts.map(part => ({
        label: part.renderLabel(),
        entries: election.parties.map(party => getCell(election, party, part))
    }));
    // rows.push({
    // label: "Overall",
    // entries: election.parties.map(party => getCell(election, party))
    // });
    return html`
        <h4>${election.name}</h4>
        ${DataTable(headers, rows)}
    `;
};
