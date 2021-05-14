import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";

export default () => {
    listPlacesForState("Virginia").then(places => {
        const target = document.getElementById("districting-options");
        render(districtingOptions(places), target);
    });
    render(plansSection(), document.getElementById("plans"));
};

const plans = [
    {
        title: "Sample valid plans",
        plans: [
            {
                id: "plan3",
                name: "3-district plan",
                numbers: [
                    { number: 3, caption: "50.6% non-White, performance: 5/9 candidates of choice, with Rouse inside" },
                ]
            },
            {
                id: "plan7",
                name: "7-district plan",
                numbers: [
                    { number: 4, caption: "coalition: 50.2%, performance: 5/9 candidates of choice" },
                    { number: 5, caption: "coalition: 50.8%, performance: 8/9 candidates of choice, with Wooten inside" }
                ]
            },
            {
                id: "plan10",
                name: "10-district plan",
                numbers: [
                    { number: 4, caption: "coalition: 50.2%, performance: 8/9 candidates of choice, both plaintiffs inside" },
                    { number: 7, caption: "coalition: 50.3%, performance: 5/9 candidates of choice" },
                    { number: 8, caption: "coalition: 50.1%, performance: 5/9 candidates of choice, with Wooten inside" }
                ]
            }
        ]
    }
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

    <a href="https://deploy-preview-338--districtr-web.netlify.app/edit?url=/assets/virginiabeach-plans/${plan.id}.json">
        <li class="plan-thumbs__thumb">
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
            ${placeItemsTemplate(places[1], startNewPlan)}
            ${placeItemsTemplate(places[2], startNewPlan)}
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
