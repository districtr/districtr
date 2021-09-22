import { interpolateRdBu } from "d3-scale-chromatic";
import { html } from "lit-html";
import { roundToDecimal } from "../../utils";
import DataTable from "./DataTable";
import { getPartyRGBColors } from "../../layers/color-rules"

/**
 * Get the style property for a cell in the ElectionResults table,
 * based on which party's vote percentage is written in it and
 * what that percentage is.
 *
 * @todo Generalize this for when the parties are not just
 *  "Republican" and "Democratic"
 *
 * @param {number} percent
 * @param {Subgroup} party
 */
export function getCellStyle(percent, party) {
    if ((party.name === "Democratic" || party.name.includes("(Dem)")) && percent > 0.5) {
        return `text-align: center; background: ${interpolateRdBu(percent)}; color: ${percent > 0.9 ? "white" : "black"}`;
    } else if ((party.name === "Republican" || party.name.includes("(Rep)")) && percent > 0.5) {
        return `text-align: center; background: ${interpolateRdBu(1 - percent)}; color: ${percent > 0.9 ? "white" : "black"}`;
    }
    return `text-align: center; background: #f9f9f9`;
}

export function getCell(party, part) {
    let percent;
    if (part !== undefined && part !== null) {
        percent = party.getFractionInPart(part.id);
    } else {
        percent = party.getOverallFraction();
    }
    return {
        content: `${roundToDecimal(percent * 100, 2)}%`,
        style: getCellStyle(percent, party)
    };
}

export function getCellSeatShare(party, election) {
    let won = election.getSeatsWonParty(party);
    let total = party.data.length;
    return {
        content: `${roundToDecimal(won/total * 100, 2)}%`,
        style: getCellStyle(won/total, party)
    };
}

export function parseElectionName(election) {
    let yr = election.substring(0,4);
    if (isNaN(yr))
        return election
    if (election.includes('Presidential') || election.includes('President'))
        return yr + " PRES"
    if (election.includes('Senate'))
        return yr + " SEN"
    if (election.includes('Governor'))
        return yr + " GOV"
    if (election.includes('Secretary of State'))
        return yr + " SoS"
    if (election.includes("Attorney General"))
        return yr + " AG"
    if (election.includes('Treasurer'))
        return yr + " TRE"
    return election
}

function PartisanSummary(elections, parts) {
    const headers = elections[0].parties.map(party => {
                        const rgb = getPartyRGBColors(party.name + party.key);
                        return html`<div style="color: rgb(${rgb[0]},${rgb[1]},${rgb[2]})">${party.name}</div>`});
    let rows = [];
    for (let election of elections) {
        rows.push({
            label: parseElectionName(election.name),
            entries: [{content: "", style: "background: #ffffff"}, {content: "", style: "background: #ffffff"}]
        })
        rows.push({
            label: "Vote Share",
            entries: election.parties.map(party => getCell(party, null))
        });
        rows.push({
            label: "Seat Share",
            entries: election.parties.map(party => getCellSeatShare(party, election))
        });
    }  
    return html`
        ${elections[0].parties.length === 2 ? html`<strong>two-way vote share</strong>` : ""}
        ${DataTable(headers, rows)}
    `;
}

export default function PartisanSummarySection(
    elections,
    parts,
    uiState,
    dispatch
) {
    return html`
        <section class="toolbar-section">
            ${PartisanSummary(
                elections,
                parts
            )}
        </section>
    `;
}
