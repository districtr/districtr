import { html } from "lit-html";

export const loadablePlans = plans =>
    html`
        <ul class="plan-thumbs u-centered">
            ${plans.map(loadablePlan)}
        </ul>
    `;

export const numberList = numbers => html`
    <dl class="number-list">
        ${numbers.map(
            ({ number, caption }) => html`
                <div class="number-list__row">
                    <dt class="number-list__number">${number}</dt>
                    <dd class="number-list__caption">${caption}</dd>
                </div>
            `
        )}
    </dl>
`;

export const loadablePlan = plan => html`
    <a href="${plan.url}">
        <li class="plan-thumbs__thumb">
            <img
                class="thumb__img"
                src="${plan.image}"
                alt="Districting Plan ${plan.id}"
            />
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.name || plan.id}</h6>
                ${plan.place
                    ? html`
                          <p class="thumb__datum">${plan.place.name}</p>
                      `
                    : ""}
                ${plan.problem
                    ? html`
                          <p class="thumb__datum">${plan.problem.name}</p>
                      `
                    : ""}
                ${plan.modified_at
                    ? html`
                          <p class="thumb__datum">
                              Last modified ${plan.modified_at}
                          </p>
                      `
                    : ""}
                ${plan.description ? plan.description : ""}
                ${plan.numbers ? numberList(plan.numbers) : ""}
            </figcaption>
        </li>
    </a>
`;
