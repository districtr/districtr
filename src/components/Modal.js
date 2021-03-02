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

export function renderSaveModal(state, savePlanToDB) {
    const target = document.getElementById("modal");

    savePlanToDB(state, undefined, null, (_id, action) => {
        let eventdefault = "";
        if (window.location.href.includes("event=")) {
            eventdefault = window.location.href.split("event=")[1].split("&")[0].split("#")[0];
        }
        let withUrl = (_id) => {
            render(renderModal(
                html`
                    <h2>Share Plan</h2>
                    You can share your current plan by copying this URL:
                    <code>https://${window.location.host}/${action}/${_id}</code>
                    <br/>
                    <label>Add tags? (events, organizations)</label>
                    <input
                        id="event-coder"
                        type="text"
                        class="text-input"
                        value="${eventdefault}"
                        @input="${() => {
                            document.getElementById("re-save").disabled = false;
                            document.getElementById("extra-event").style.display = "block";
                        }}"
                    />
                    <div id="${eventdefault.length || "extra-event"}">
                      <label>Team or Plan Name</label>
                      <input
                          id="event-plan-name"
                          type="text"
                          class="text-input"
                          value=""
                          @input="${() => document.getElementById("re-save").disabled = false}"
                      />
                    </div>
                    <button
                        id="re-save"
                        disabled
                        @click="${() => {
                            exportPlanToDB(
                                state,
                                document.getElementById("event-coder").value,
                                document.getElementById("event-plan-name").value,
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
