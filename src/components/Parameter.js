import { html } from "lit-html";

export const Parameter = ({ label, element }) =>
    html`
        <div class="parameter">
            <label class="parameter__label ui-label">${label}</label>${element}
        </div>
    `;

export default Parameter;
