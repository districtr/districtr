import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";
import validEventCodes from "../validEventCodes";

export default () => {
    const eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    ).toLowerCase();

    if (validEventCodes[eventCode]) {
        document.getElementById("eventHeadline").innerText = eventCode;

        listPlacesForState(validEventCodes[eventCode]).then(places => {
            const target = document.getElementById("districting-options");
            render(districtingOptions(places), target);
        });

        fetch("/.netlify/functions/eventRead?event=" + eventCode)
            .then(res => res.json())
            .then(data => {
                const plans = [{
                    title: "Submitted plans",
                    plans: data.plans
                }];
                render(plansSection(plans), document.getElementById("plans"));
            });
    } else {
        render("Event code not recognized", target);
    }
};

const plansSection = (plans) =>
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
    <a href="/edit/${plan.simple_id || plan._id}">
        <li class="plan-thumbs__thumb">
            ${(typeof plan.screenshot !== 'undefined')
                ? html`<img
                    class="thumb__img"
                    src="${plan.screenshot}"
                    alt="Districting Plan ${plan.simple_id}"
                />`
                : null
            }
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.simple_id || plan._id}</h6>
            </figcaption>
            <span>${(plan.filledBlocks || 0).toLocaleString()} units</span>
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
