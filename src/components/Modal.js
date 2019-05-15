import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";

export function renderAboutModal({ place, unitsRecord }) {
    renderModal({
        title: place.name,
        subtitle: unitsRecord.name,
        content: until(
            fetch(`/assets/about/${place.slug}/${unitsRecord.slug}.html`)
                .then(r => r.text())
                .then(content => html([content]))
        )
    });
}

export function renderModal(args) {
    const target = document.getElementById("modal");
    render(Modal(() => render("", target), args), target);
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
