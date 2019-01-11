import { interpolateRdBu } from "d3-scale-chromatic";
import { html } from "lit-html";
import { roundToDecimal } from "../../utils";

function getCellStyle(percent, party) {
    if (party === "Democratic" && percent > 0.5) {
        return `background: ${interpolateRdBu(percent)}`;
    } else if (party === "Republican" && percent > 0.5) {
        return `background: ${interpolateRdBu(1 - percent)}`;
    }
    return `background: #f9f9f9`;
}

export default (election, parts) => {
    const parties = election.parties;
    return html`
        <h4>${election.name}</h4>
        <table class="election-results-table">
            <thead>
                <tr>
                    <th></th>
                    ${
                        parties.map(
                            party =>
                                html`
                                    <th>${party}</th>
                                `
                        )
                    }
                </tr>
            </thead>
            <tbody>
                ${
                    parts.map(
                        (part, i) =>
                            html`
                                <tr>
                                    <th>${part.renderLabel()}</th>
                                    ${
                                        parties.map(party => {
                                            const percent = election.percent(
                                                party,
                                                i
                                            );
                                            return html`
                                                <td
                                                    style="${
                                                        getCellStyle(
                                                            percent,
                                                            party
                                                        )
                                                    }"
                                                >
                                                    ${
                                                        roundToDecimal(
                                                            percent * 100,
                                                            2
                                                        )
                                                    }%
                                                </td>
                                            `;
                                        })
                                    }
                                </tr>
                            `
                    )
                }
            </tbody>
        </table>
    `;
};
