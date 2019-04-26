import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";

export function renderAboutModal({ place, units }) {
    const target = document.getElementById("modal");
    const template = html`
        <div class="modal-wrapper" @click="${() => render("", target)}">
            <div class="modal-content">
                <button
                    class="button button--transparent button--icon media__close"
                    @click=${() => render("", target)}
                >
                    <i class="material-icons">
                        close
                    </i>
                </button>

                <h2>${place.name}</h2>
                <h3>${units.name}</h3>
                ${until(
                    html([
                        fetch(
                            `/assets/about/${place.id}/${units.id}.html`
                        ).then(r => r.text())
                    ]),
                    ""
                )}
            </div>
        </div>
    `;
    render(template, target);
}
