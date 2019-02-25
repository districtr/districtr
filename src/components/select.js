import { html } from "lit-html";

export default function select(name, items, handler, selectedIndex) {
    return html`
        <select
            name="${name}"
            @change="${e => handler(parseInt(e.target.value))}"
        >
            ${items.map(
                (item, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${item.name}</option
                    >
                `
            )}
        </select>
    `;
}
