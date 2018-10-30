import { html } from "lit-html";

const template = (data, parts, parties, getCellColor) => html`
    <table class="election-results-table">
        <thead>
            <tr>
            <th>
            </th>
            ${parties.map(party => html`<th>${party.name}</th>`)}
            </tr>
        </thead>
        <tbody>
            ${data.map((d, i) => {
                html`<tr>
                <th>${d.partoun}
                <span class="part-number" style="background: ${parts[i].color}">
                ${i}
                </span>
                </th>
                </tr>`;
            })}
        </tbody>
    </table>
`;

class Part {
    constructor(id, noun, color) {
        this.id = id;
        this.noun = noun;
        this.color = color;
    }
    renderLabel() {
        return html`
        ${this.noun} <span class="part-number" style="background: ${
            this.color
        }">
        ${this.id}
        </span>`;
    }
}
