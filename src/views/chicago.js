import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";

export default () => {
    listPlacesForState("Illinois").then(places => {
        const target = document.getElementById("districting-options");
        render(districtingOptions(places), target);
    });
    render(plansSection(), document.getElementById("plans"));
};

const plans = [
    {
        title: "Current enacted plan",
        plans: [
            {
                id: "current-wards",
                name: "Current Enacted Plan",
                numbers: [
                    { number: 46, caption: "wards with a majority race" },
                    { number: 38, caption: "segregated wards" },
                    { number: 19, caption: "hypersegregated wards" },
                    { number: 19, caption: "wards with concentrated poverty" },
                    { number: 13, caption: "wards with concentrated wealth" }
                ]
            }
        ]
    },
    {
        title: "50 single-member wards built out of precincts",
        plans: [
            {
                id: "prec50-6084",
                name: "Plan #6084",
                numbers: [
                    {
                        number: 26,
                        caption: "segregated wards (fewest)"
                    }
                ]
            },
            {
                id: "prec50-12816",
                name: "Plan #12816",
                description: "Most economic parity",
                numbers: [
                    {
                        number: 13,
                        caption: "wards with concentrated poverty (fewest)"
                    },
                    {
                        number: 5,
                        caption: "wards with concentrated wealth"
                    }
                ]
            },
            {
                id: "prec50-55139",
                name: "Plan #55139",
                numbers: [
                    {
                        number: 34,
                        caption: "wards with a majority race (fewest)"
                    }
                ]
            }
        ]
    },
    {
        title: "10 multi-member wards built out of precincts",
        plans: [
            {
                id: "prec10-205",
                name: "Plan #205",
                description: "Most economic parity",
                numbers: [
                    { number: 1, caption: "ward with concentrated poverty" },
                    { number: 0, caption: "wards with concentrated wealth" }
                ]
            },
            {
                id: "prec10-8178",
                name: "Plan #8178",
                numbers: [
                    {
                        number: 0,
                        caption: "hypersegregated wards"
                    }
                ]
            },
            {
                id: "prec10-8698",
                name: "Plan #8698",
                numbers: [
                    {
                        number: 3,
                        caption: "wards with a majority race (fewest)"
                    }
                ]
            },
            // { id: "prec10-41323" },
            {
                id: "prec10-55213",
                name: "Plan #55213",
                numbers: [
                    {
                        number: 6,
                        caption: "highly diverse wards (most)"
                    }
                ]
            }
            // { id: "prec10-86660" }
        ]
    },
    {
        title: "10 multi-member wards built out of community areas",
        plans: [
            {
                id: "ca10-937",
                name: "Plan #937",
                numbers: [
                    {
                        number: 0,
                        caption: "hypersegregated wards"
                    }
                ]
            },
            {
                id: "ca10-1042",
                name: "Plan #1042",
                numbers: [
                    {
                        number: 3,
                        caption: "wards with a majority race (fewest)"
                    }
                ]
            },
            // { id: "ca10-5304" },
            {
                id: "ca10-5848",
                name: "Plan #5848",
                description: "Most economic parity",
                numbers: [
                    { number: 1, caption: "ward with concentrated poverty" },
                    { number: 0, caption: "wards with concentrated wealth" }
                ]
            },
            {
                id: "ca10-25218",
                name: "Plan #25218",
                numbers: [
                    {
                        number: 6,
                        caption: "highly diverse wards (most)"
                    }
                ]
            }
            // { id: "ca10-87557" }
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
    <a href="/edit?url=/assets/chicago-plans/${plan.id}.json?v=2">
        <li class="plan-thumbs__thumb">
            <img
                class="thumb__img"
                src="/assets/chicago-plans/${plan.id}.png?v=2"
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
                            ${problem.type === "multimember"
                                ? "Multi-member wards of varying sizes"
                                : `${problem.numberOfParts} ${
                                      problem.pluralNoun
                                  }`}
                        </div>
                        <div class="place-info">
                            Built out of ${units.unitType}
                        </div>
                    </li>
                `
            )
        )
        .reduce((items, item) => [...items, ...item], []);
