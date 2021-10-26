import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";
import { spatial_abilities } from "../utils";


/**
 * @desc Closes a modal.
 */
export function closeModal() {
    let modal = document.getElementById("modal");
    render("", modal);
}

export function renderModal(innerContent) {
    const target = document.getElementById("modal");
    const template = html`
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

    return template;
}

export function renderSaveModal(state, savePlanToDB, isFromQAPortal, draft) {
    const target = document.getElementById("modal");
    savePlanToDB(state, undefined, null, (_id, action) => {
        let eventdefault = "";
        if (window.location.href.includes("event=")) {
            eventdefault = window.location.href.split("event=")[1].split("&")[0].split("#")[0];
        }
        let portalLink = spatial_abilities(state.place.id).portal.endpoint;
        let shareLink = "";
        if (spatial_abilities(state.place.id).portal && spatial_abilities(state.place.id).portal.saveredirect) {
            shareLink = `${spatial_abilities(state.place.id).portal.saveredirect}?p=${_id}`;
        } else {
            shareLink = `${window.location.host}/${action}/${_id}`;
        }
        if (isFromQAPortal) {
            portalLink = portalLink.replace('portal','qa-portal')
        }
        if (draft) {
            portalLink += '/plans'
        }
        let portalName = state.place.state;
        if (state.place.id === "ca_SanDiego") {
            portalName = "City of San Diego";
        } else if (state.place.id === "minneapolis") {
            portalName = "City of Minneapolis";
        }
        let withUrl = (_id) => {
            render(renderModal(
                html`
                    <h3>Plan has been saved</h3>
                    <label>Use this URL to share your plan!</label>
                    <code>https://${shareLink}</code>
                    <button
                        id="copy-button"
                        @click="${() => {
                            var dummy = document.createElement("textarea");
                            document.body.appendChild(dummy);
                            console.log(shareLink);
                            dummy.value = `https://${shareLink}`;
                            dummy.focus();
                            dummy.select();
                            dummy.setSelectionRange(0, 99999); /* For mobile devices */
                            document.execCommand("copy");
                            document.body.removeChild(dummy);
                            document.getElementById("copy-button").innerHTML = "Copied";
                        }}"
                    > Copy to Clipboard </button>
                    <br/>
                    <p>You can close this window and keep working, and update whenever you’d like.  Even if you share the link, nobody but you can change your plan—other people’s changes will save to a new link.</p>
                    <p>When you are ready, you can bring this map back to the submission form on the ${portalName} Redistricting Public Comment Portal.</p>
                    <div style="text-align:center">
                      <a
                        href="${portalLink}?${state.plan.problem.type === "community" ? "coi" : "plan"}id=${_id}${draft ? "&draftid=" + draft : ""}#form"
                        target="_blank"
                        style="margin-left:auto;margin-right:auto;padding:6px;background:#1b5956;color:#fff;border-radius:.5rem;padding:.375rem .75rem;font-size:1rem;margin-top:.5rem;display:inline-block;"
                      >
                        Proceed to Submit Map
                      </a>
                    </div>
                `
            ), target);
        };
        if (_id || window.location.hostname === "localhost") {
            withUrl(_id);
        }
    });
}

export function renderEventModal(state, savePlanToDB, eventCode) {
    const target = document.getElementById("modal");
    savePlanToDB(state, undefined, null, (_id, action) => {
        const shareLink = `${window.location.host}/${action}/${_id}`;
        const tabClick = (e) => {
            document.querySelectorAll(".tab-carrier .tab").forEach((tab) => {
              tab.className = "tab";
            });
            e.target.className = "tab tab-selected";
        };
        let withUrl = (_id) => {
            render(renderModal(
                html`
                    <h3>Plan has been saved</h3>
                    <label>Use this URL to share your plan!</label>
                    <code>https://${shareLink}</code>
                    <button
                        id="copy-button"
                        @click="${() => {
                            var dummy = document.createElement("textarea");
                            document.body.appendChild(dummy);
                            console.log(shareLink);
                            dummy.value = `https://${shareLink}`;
                            dummy.focus();
                            dummy.select();
                            dummy.setSelectionRange(0, 99999); /* For mobile devices */
                            document.execCommand("copy");
                            document.body.removeChild(dummy);
                            document.getElementById("copy-button").innerHTML = "Copied";
                        }}"
                    > Copy to Clipboard </button>
                    <br/>
                    <p>You can close this window and keep working, and update whenever you’d like.  Even if you share the link, nobody but you can change your plan—other people’s changes will save to a new link.</p>
                    <label>Would you like to Share Now, or save the map as a Work in Progress?</label>
                    <label class="wrap">
                        <input id="event-share-now"
                          type="radio"
                          name="modal-draft"
                          checked
                          @change="${e => {
                            if (document.getElementById("event-share-now").checked) {
                              document.getElementById("modal-gallery-opt").style.display = "block";
                              document.getElementById("modal-draft-opt").style.display = "none";
                            } else {
                              document.getElementById("modal-gallery-opt").style.display = "none";
                              document.getElementById("modal-draft-opt").style.display = "block";
                            }
                          }}"
                        >
                        Share Now
                    </label>
                    <label class="wrap">
                        <input id="event-draft"
                          type="radio"
                          name="modal-draft"
                          @change="${e => {
                            if (document.getElementById("event-draft").checked) {
                              document.getElementById("modal-gallery-opt").style.display = "none";
                              document.getElementById("modal-draft-opt").style.display = "block";
                            } else {
                              document.getElementById("modal-gallery-opt").style.display = "block";
                              document.getElementById("modal-draft-opt").style.display = "none";
                            }
                          }}"
                        >
                        Work in Progress
                    </label>
                    <br/>
                    <div class="col">
                      <label>Tag or Event Code</label>
                      <span style="margin-top:8px">#${eventCode}</span>
                    </div>
                    <div class="col">
                      <label>Team or Plan Name</label>
                      <input
                          id="event-plan-name-extra"
                          type="text"
                          class="text-input"
                          autofill="off"
                          value=""
                      />
                    </div>
                    <button
                      id="modal-gallery-opt"
                      style="display:block;background:#1b5956;color:#fff;margin-left:auto;margin-right:auto;padding:6px;border-radius:.5rem;padding:.375rem .75rem;font-size:1rem;margin-top:.5rem;text-select:none;"
                      @click="${() => {
                        savePlanToDB(
                            state,
                            eventCode,
                            document.getElementById("event-plan-name-extra").value,
                            () => {
                                console.log("added event code");
                                document.querySelectorAll(".media__close").forEach((c) => c.click());
                            },
                            true,
                        )
                      }}"
                    >
                      Share to Gallery
                    </button>
                    <button
                      id="modal-draft-opt"
                      style="display:none;background:#C70063;color:#fff;margin-left:auto;margin-right:auto;padding:6px;border-radius:.5rem;padding:.375rem .75rem;font-size:1rem;margin-top:.5rem;text-select:none;"
                      @click="${() => {
                        savePlanToDB(
                            state,
                            eventCode,
                            document.getElementById("event-plan-name-extra").value,
                            () => {
                                console.log("added event code");
                                document.querySelectorAll(".media__close").forEach((c) => c.click());
                            },
                            false,
                        )
                      }}"
                    >
                      Save as Draft
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
        fetch(`/assets/about/${place.id}/${unitsRecord.id}.html?v=2`)
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

export function renderVRAAboutModal(place) {
    const target = document.getElementById("modal");
    const template = until(
        fetch(`/assets/about/vra/precomputation_${place.id}.html?v=2`)
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
                        ${html([content])}
                    `
                )
            ),
        ""
    );
    render(template, target);
}
