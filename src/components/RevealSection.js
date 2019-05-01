import { html } from "lit-html";
import { classMap } from "lit-html/directives/class-map";

function Reveal(content, isOpen) {
    return html`
        <div class=${classMap({ reveal: true, "reveal--hidden": !isOpen })}>
            ${isOpen ? content : ""}
        </div>
    `;
}

function headerWithToggle(text, isOpen, onChange) {
    return html`
        <div class="header-with-toggle" @click=${onChange}>
            <button
                class=${classMap({
                    "header-with-toggle__icon": true,
                    open: isOpen
                })}
            >
                <i class="material-icons">arrow_right</i>
            </button>
            <h4 class="header-with-toggle__header">${text}</h4>
        </div>
    `;
}

export default function RevealSection(chartName, content, isOpen, onToggle) {
    return html`
        ${headerWithToggle(chartName, isOpen, onToggle)}
        ${Reveal(content, isOpen)}
    `;
}
