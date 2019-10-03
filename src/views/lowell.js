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
                id: "lowell3",
                name: "3-district plan",
                numbers: []
            },
            {
                id: "lowell3a",
                name: "3-district plan",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 7-district plans",
        plans: [
            {
                id: "lowell7",
                name: "7-district plan",
                numbers: []
            },
            {
                id: "lowell7a",
                name: "7-district plan",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 8-district plans",
        plans: [
            {
                id: "lowell8",
                name: "8-district plan",
                numbers: []
            },
            {
                id: "lowell8a",
                name: "8-district plan",
                numbers: []
            }
        ]
    },
    {
        title: "Sample valid 9-district plans",
        plans: [
            {
                id: "lowell9",
                name: "9-district plan",
                numbers: []
            },
            {
                id: "lowell9a",
                name: "9-district plan",
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
                src="/assets/lowell-plans/${plan.id}.png"
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
