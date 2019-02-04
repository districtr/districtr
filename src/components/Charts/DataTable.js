import { html } from "lit-html";

function headerRow(variableNames) {
    return html`
        <tr>
            <th></th>
            ${variableNames.map(
                name =>
                    html`
                        <th>${name}</th>
                    `
            )}
        </tr>
    `;
}

function cell({ content, style }) {
    return html`
        <td style=${style}>${content}</td>
    `;
}

// export default (
//     variables,
//     parts,
//     getVariableName,
//     getCellStyle,
//     getValue,
//     formatValue,
//     additionalRows = []
// ) => html`
//     <table class="data-table">
//         <thead>
//             ${headerRow(variables.map(v => getVariableName(v)))}
//         </thead>
//         <tbody>
//             ${parts.map(
//                 (part, i) =>
//                     html`
//                         <tr>
//                             <th>${part.renderLabel()}</th>
//                             ${variables.map(variable =>
//                                 cell(
//                                     variable,
//                                     i,
//                                     getCellStyle,
//                                     getValue,
//                                     formatValue
//                                 )
//                             )}
//                         </tr>
//                     `
//             )}
//         </tbody>
//     </table>
// `;

export default (header, rows) => html`
        <table class="data-table">
            <thead>
                ${headerRow(header)}
            </thead>
            <tbody>
                ${rows.map(
                    row =>
                        html`
                            <tr>
                                <th>${row.label}</th>
                                ${row.entries.map(entry => cell(entry))}
                            </tr>
                        `
                )}
            </tbody>
        </table>
    `;
