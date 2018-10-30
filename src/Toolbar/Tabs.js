import { html } from "lit-html";

export default (tabs, onChange) => html`
    <ul class="tabs">
        ${tabs.map(
            tab => html`
        <li>
            <input
                type="radio"
                name="tabs"
                value="${tab.value}"
                ?checked=${tab.checked}
                @input=${onChange}>
            <div class="tabs__tab">
            ${tab.name}
            </div>
        </li>
        `
        )}
    </ul>`;
