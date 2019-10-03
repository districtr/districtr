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
    const eventCoder = html`
        <input
            type="text"
            class="text-field"
            value=""
        />`;

    exportPlanToDB(state, undefined, (_id) => {
        let withUrl = (_id) => {
            render(renderModal(
                html`
                    <h2>Share Plan</h2>
                    Plan saved to<br/>
                    <code>${window.location.host}/edit/${_id}</code>
                    ${eventCoder}
                    <button
                        @click=${() => exportPlanToDB(state, eventCoder.value, withUrl)}
                    >
                        Save
                    </button>
                `
            ), target);
        };
        if (_id) {
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
