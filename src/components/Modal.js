import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";

function renderModal(innerContent) {
    const target = document.getElementById("modal");
    return html`
        <div
            class="modal-wrapper"
            @click="${() => render("", target)}"
        >
            <div
                class="modal-content"
                @click="${e => e.stopPropagation()}"
            >
                <button
                    class="button button--transparent button--icon media__close"
                    @click=${() => render("", target)}
                >
                    <i class="material-icons">
                        close
                    </i>
                </button>
                ${innerContent}
            </div>
        </div>
    `;
}

export function renderSaveModal(state, exportPlanToDB) {
    const target = document.getElementById("modal");

    exportPlanToDB(state, undefined, (_id) => {
        let withUrl = (_id) => {
            render(renderModal(
                html`
                    <h2>Uploaded Plan</h2>
                    You can share your current plan with the URL in your address bar:
                    <code>https://${window.location.host}/edit/${_id}</code>
                    <br/>
                    <label>Have an event code?</label>
                    <input
                        id="event-coder"
                        type="text"
                        class="text-input"
                        value=""
                        @input="${() => document.getElementById("re-save").disabled = false}"
                    />
                    <br/>
                    <button
                        id="re-save"
                        disabled
                        @click="${() => {
                            exportPlanToDB(
                                state,
                                document.getElementById("event-coder").value,
                                () => { console.log("added event code"); }
                            );
                            render("", target);
                        }}"
                    >
                        Add to Event
                    </button>
                `
            ), target);
        };
        if (_id || window.location.hostname === "localhost") {
            withUrl(_id);
        }
    });
}

export function renderAboutModal({ place, unitsRecord }, userRequested) {
    const target = document.getElementById("modal");
    const template = until(
        fetch(`/assets/about/${place.id}/${unitsRecord.id}.html`)
            .then((r) => {
                if (r.status === 200) {
                    return r.text();
                } else if (userRequested) {
                    return "No About Page exists for this project";
                } else {
                    throw new Error(r.statusText);
                }
            })
            .then(
                content => renderModal(
                    html`
                        <h2 class="media__title">${place.name}</h2>
                        <h3 class="media__subtitle">${unitsRecord.name}</h3>
                        ${html([content])}
                    `
                )
            ),
        ""
    );
    render(template, target);
}
