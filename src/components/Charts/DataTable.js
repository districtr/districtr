import { html } from "lit-html";

function HeaderRow(variableNames, left_corner) {
    return html`
        <tr>
            ${left_corner ? "" : html`<th></th>`}
            ${variableNames.map(
                name =>
                    html`
                        <th class="data-table__column-heading" colSpan=${variableNames.length === 1 ? 2 : 1}>
                            ${name}
                        </th>
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

export const DataTable = (header, rows, left_corner=false) => html`
    <table class="data-table">
        ${header
            ? html`
                  <thead>
                      ${HeaderRow(header, left_corner)}
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
