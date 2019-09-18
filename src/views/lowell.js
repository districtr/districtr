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
        title: "Plans with roughly equal Latinx + Asian-American CVAP in each district",
        plans: [
            {
                id: "3districts",
                name: "3 District Plan",
                numbers: [
                    // { number: 0, caption: "coalition districts" }
                ]
            }
        ]
    },
    {
        title: "Plans with 2 majority-coalition CVAP districts with highest possible 3rd coalition district found in ensemble",
        plans: [
            {
                id: "7districts",
                name: "7 District Plan",
                numbers: [
                    // { number: 2, caption: "coalition districts" }
                ]
            },
            {
                id: "8districts",
                name: "8 District Plan",
                numbers: [
                    // { number: 2, caption: "coalition districts" }
                ]
            },
            {
                id: "9districts",
                name: "9 District Plan",
                numbers: [
                    // { number: 3, caption: "coalition districts" }
                ]
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
