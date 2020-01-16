import { html } from "lit-html";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

export default function Select(items, handler, selectedIndex) {
    return html`
        <select @change="${e => handler(parseInt(e.target.value))}">
            ${items.map(
                (item, i) => html`
                    <option value="${i}" ?selected=${selectedIndex === i}
                        >${i18n.race[item.key] || item.name}</option
                    >
                `
            )}
        </select>
    `;
}
