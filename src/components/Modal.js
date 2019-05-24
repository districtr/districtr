import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";
import { savePlan, renamePlan, saveNewPlan, deletePlan } from "../api/plans";
import { navigateTo } from "../routes";

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

export function renderSaveModal(state) {
    renderModal({
        title: "Save this plan",
        content: SaveForm(state.plan, () => {
            const name = document.getElementById("plan-name").value;
            state.plan.name = name;
            return savePlan(state);
        })
    });
}

export function renderSaveAsModal(state) {
    let newPlan = state.plan.copy();
    renderModal({
        title: "Save a new copy of this plan",
        content: SaveForm(newPlan, () => {
            const name = document.getElementById("plan-name").value;
            newPlan.name = name;
            state.plan = newPlan;
            return saveNewPlan(state);
        })
    });
}

export function renderRenameModal(state) {
    renderModal({
        title: "Rename this plan",
        content: SaveForm(state.plan, () => {
            const name = document.getElementById("plan-name").value;
            state.plan.name = name;
            return renamePlan(state);
        })
    });
}

export function renderDeleteModal(state) {
    renderModal({
        title: "Delete this plan",
        content: html`
            <p>Are you sure you want to delete ${state.plan.name}?</p>
            <div class="option-list__item">
                <button
                    @click=${e => {
                        e.stopPropagation();
                        deletePlan(state).then(resp => {
                            if (resp.ok) {
                                navigateTo("/dashboard");
                            } else {
                                console.error("Could not delete plan");
                            }
                        });
                    }}
                    class="button button--submit"
                >
                    Delete
                </button>
            </div>
        `
    });
}

export function SaveForm(plan, onSubmit) {
    return html`
        <form
            id="save-form"
            @submit=${e => {
                e.stopPropagation();
                onSubmit(e);
                closeModal();
            }}
        >
            <div class="option-list__item">
                <label class="ui-label" for="name">Name</label>
                <input
                    type="text"
                    id="plan-name"
                    name="name"
                    class="text-input"
                    .value=${plan.name}
                    required
                />
            </div>
            <div class="option-list__item">
                <input
                    id="submit"
                    type="submit"
                    name="submit"
                    class="button button--submit button--alternate"
                    value="Save"
                />
            </div>
        </form>
    `;
}

function closeModal() {
    render("", document.getElementById("modal"));
}

export function renderModal(args) {
    const target = document.getElementById("modal");
    render(Modal({ onClose: closeModal, ...args }), target);
}

export function Modal({ title, subtitle, content, onClose }) {
    return html`
        <div class="modal-wrapper" @click="${onClose}">
            <div class="modal-content" @click=${e => e.stopPropagation()}>
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
