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
    variables,
    parts,
    getVariableName,
    getCellStyle,
    getValue,
    formatValue
) => html`
    <table class="data-table">
        <thead>
            ${headerRow(variables.map(v => getVariableName(v)))}
        </thead>
        <tbody>
            ${
                parts.map(
                    (part, i) =>
                        html`
                            <tr>
                                <th>${part.renderLabel()}</th>
                                ${
                                    variables.map(variable =>
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
