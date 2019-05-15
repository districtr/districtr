import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";

export function renderAboutModal({ place, unitsRecord }) {
    const target = document.getElementById("modal");
    const template = until(
        fetch(`/assets/about/${place.id}/${unitsRecord.id}.html`)
            .then(r => r.text())
            .then(content =>
                Modal(() => render("", target), {
                    title: place.name,
                    sutitle: unitsRecord.name,
                    content: html([content])
                })
            )
    );
    render(template, target);
}

export function Modal(onClose, { title, subtitle, content }) {
    return html`
        <div class="modal-wrapper" @click="${onClose}">
            <div class="modal-content">
                <button
                    class="button button--transparent button--icon media__close"
                    @click=${onClose}
                >
                    <i class="material-icons">
                        close
                    </i>
                </button>

                <h2 class="media__title">${title}</h2>
                ${subtitle
                    ? html`
                          <h3 class="media__subtitle">${subtitle}</h3>
                      `
                    : ""}
                ${content}
            </div>
        </div>
    `;
}
