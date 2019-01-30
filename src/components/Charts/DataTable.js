import { html } from "lit-html";

function headerRow(variableNames) {
    return html`
        <tr>
            <th></th>
            ${
                variableNames.map(
                    name =>
                        html`
                            <th>${name}</th>
                        `
                )
            }
        </tr>
    `;
}

function cell(variable, i, getCellStyle, getValue, formatValue) {
    const value = getValue(variable, i);
    return html`
        <td style=${getCellStyle(value, variable)}>${formatValue(value)}%</td>
    `;
}

export default (
    tableName,
    variableNames,
    parts,
    getCellStyle,
    getValue,
    formatValue
) => html`
    <h4>${tableName}</h4>
    <table class="data-table">
        <thead>
            ${headerRow(variableNames)}
        </thead>
        <tbody>
            ${
                parts.map(
                    (part, i) =>
                        html`
                            <tr>
                                <th>${part.renderLabel()}</th>
                                ${
                                    variableNames.map(variable =>
                                        cell(
                                            variable,
                                            i,
                                            getCellStyle,
                                            getValue,
                                            formatValue
                                        )
                                    )
                                }
                            </tr>
                        `
                )
            }
        </tbody>
    </table>
`;
