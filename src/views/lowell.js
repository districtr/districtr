import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";

export default () => {
    listPlacesForState("Massachusetts").then(places => {
        const target = document.getElementById("districting-options");
        render(districtingOptions(places), target);
    });
    render(plansSection(), document.getElementById("plans"));
};

const plans = [
        {
        title: "Sample valid 3-district plans",
        plans: [
            {
                id: "plan3a",
                name: "Random Plan 3A (3-districts)",
                numbers: []
            },
            {
                id: "plan3b",
                name: "Random Plan 3B (3-districts)",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 7-district plans",
        plans: [
            {
                id: "plan7a",
                name: "Random Plan 7A (7-districts)",
                numbers: []
            },
            {
                id: "plan7b",
                name: "Random Plan 7B (7-districts)",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 8-district plans (Option on the Ballot)",
        plans: [
            {
                id: "plan8a",
                name: "Random Plan 8A (8-districts)",
                numbers: []
            },
            {
                id: "plan8b",
                name: "Random Plan 8B (8-districts)",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 9-district plans",
        plans: [
            {
                id: "plan9a",
                name: "Random Plan 9A (9-districts)",
                numbers: []
            },
            {
                id: "plan9b",
                name: "Random Plan 9B (9-districts)",
                numbers: []
            }
        ]
    },
];

const plansSection = () =>
    plans.map(
        ({ title, plans }) => html`
            <section class="place__section">
                <h3>${title}</h3>
                ${loadablePlans(plans)}
            </section>
        `
    );

const loadablePlans = plans =>
    html`
        <ul class="plan-thumbs">
            ${plans.map(loadablePlan)}
        </ul>
    `;

const numberList = numbers => html`
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

const loadablePlan = plan => html`
    <a href="/lowell/${plan.id}">
        <li class="plan-thumbs__thumb">
            <img
                class="thumb__img"
                src="/assets/lowell-plans/${plan.id}.png?v=2"
                alt="Districting Plan ${plan.id}"
            />
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.name || plan.id}</h6>
                ${plan.description ? plan.description : ""}
                ${plan.numbers ? numberList(plan.numbers) : ""}
            </figcaption>
        </li>
    </a>
`;

const districtingOptions = places =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItemsTemplate(places[0], startNewPlan)}
        </ul>
    `;

const placeItemsTemplate = (place, onClick) =>
    place.districtingProblems
        .map(problem =>
            getUnits(place, problem).map(
                units => html`
                    <li
                        class="places-list__item places-list__item--small"
                        @click="${() => onClick(place, problem, units)}"
                    >
                        <div class="place-name">
                            ${problem.numberOfParts} ${problem.pluralNoun}
                        </div>
                        <div class="place-info">
                            Built out of ${units.unitType}
                        </div>
                    </li>
                `
            )
        )
        .reduce((items, item) => [...items, ...item], []);
