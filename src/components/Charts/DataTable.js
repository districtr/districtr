import { html } from "lit-html";

function headerRow(variableNames) {
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

function cell({ content, style }) {
    return html`
        <td class="ui-data data-table__cell" style=${style}>${content}</td>
    `;
}

export default (header, rows) => html`
    <table class="data-table">
        ${header
            ? html`
                  <thead>
                      ${headerRow(header)}
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
                            ${row.entries.map(entry => cell(entry))}
                        </tr>
                    `
            )}
        </tbody>
    </table>
`;
