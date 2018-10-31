import { interpolateRdBu } from "d3-scale-chromatic";
import { html } from "lit-html";
import { roundToDecimal } from "./utils";

function getCellStyle(percent, party) {
    if (party === "Democratic" && percent > 0.5) {
        return `background: ${interpolateRdBu(percent)}`;
    }
    if (party === "Republican" && percent > 0.5) {
        return `background: ${interpolateRdBu(1 - percent)}`;
    }
    return `background: #f9f9f9`;
}

const template = (election, parties, parts, getCellStyle) => html`
    <table class="election-results-table">
        <thead>
            <tr>
            <th>
            </th>
            ${parties.map(party => html`<th>${party}</th>`)}
            </tr>
        </thead>
        <tbody>
            ${parts.map(
                (part, i) =>
                    html`<tr>
                <th>${part.renderLabel()}
                </th>
                ${parties.map(party => {
                    const percent = election.percent(party, i);
                    return html`
                        <td style="${getCellStyle(percent, party)}">
                        ${roundToDecimal(percent * 100, 2)}%</td>`;
                })}
                </tr>`
            )}
        </tbody>
    </table>
`;

function abbreviate(party) {
    return party[0];
}

export default class ElectionResults {
    constructor(election, parts) {
        this.election = election;
        this.parts = parts;

        this.parties = [];
        for (let party in election.parties) {
            this.parties.push(party);
        }

        this.render = this.render.bind(this);
    }
    update(...args) {
        this.election.update(...args);
    }
    render() {
        return template(this.election, this.parties, this.parts, getCellStyle);
    }
}
