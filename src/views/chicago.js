import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";

export default () => {
    // initializeMap(
    //     "map",
    //     {
    //         maxBounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
    //         bounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
    //         fitBoundsOptions: { padding: 50 },
    //         style: "mapbox://styles/mapbox/dark-v9"
    //     },
    //     false
    // );
    listPlacesForState("Illinois").then(places => {
        const target = document.getElementById("districting-options");
        render(districtingOptions(places), target);
    });
    render(plansSection(), document.getElementById("plans"));
};

const plans = [
    {
        title: "The current wards",
        plans: ["current-wards"]
    },
    {
        title: "50 single-member wards built out of precincts",
        plans: ["prec50-4287", "prec50-12816", "prec50-55139"]
    },
    {
        title: "10 multi-member wards built out of precincts",
        plans: [
            "prec10-205",
            "prec10-8178",
            "prec10-8698",
            "prec10-41323",
            "prec10-55213",
            "prec10-86660"
        ]
    },
    {
        title: "10 multi-member wards built out of community areas",
        plans: [
            "ca10-937",
            "ca10-1042",
            "ca10-5304",
            "ca10-5848",
            "ca10-25218",
            "ca10-87557"
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

const loadablePlan = plan => html`
    <li class="plan-thumbs__thumb">
        <a href="/edit/chi-${plan}">
            <img
                class="thumb__img"
                src="./assets/chicago-plans/${plan}.png"
                alt="Districting Plan ${plan}"
            />
        </a>
    </li>
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
