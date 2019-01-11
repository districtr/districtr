import { html } from "lit-html";

export const LayerListItem = ({ label, element }) =>
    html`
        <div class="layer-list__item">
            <label class="layer-list__label">${label}:</label>${element}
        </div>
    `;

export default LayerListItem;
