import { html } from "lit-html";

function HeaderRow(variableNames) {
    return html`
        <tr>
            <th></th>
            ${variableNames.map(
                name =>
                    html`
                        <th class="data-table__column-heading">${name}</th>
                    `
            )}
        </tr>
    `;
}

function Cell({ content, style }) {
    return html`
        <td class="ui-data data-table__cell" style=${style}>${content}</td>
    `;
}

export const DataTable = (header, rows) => html`
    <table class="data-table">
        ${header
            ? html`
                  <thead>
                      ${HeaderRow(header)}
                  </thead>
              `
            : ""}
        <tbody>
            ${rows.map(
                row =>
                    html`
                        <tr>
                            <th class="data-table__row-heading">
                                ${row.label}
                            </th>
                            ${row.entries.map(entry => Cell(entry))}
                        </tr>
                    `
            )}
        </tbody>
    </table>
`;

export default DataTable;
