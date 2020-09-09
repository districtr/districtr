import { html, render } from "lit-html";
import { listPlacesForState, getUnits } from "../components/PlacesList";
import { startNewPlan } from "../routes";

const validEventCodes = {
  test: 'pennsylvania',
  fyi: 'forsyth_nc',
  unc: 'nc'
}

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

        let showPlans = (data) => {
            const plans = [{
                title: "Submitted plans",
                plans: data.plans
            }];
            render(plansSection(plans), document.getElementById("plans"));
        }

        fetch("/.netlify/functions/eventRead?event=" + eventCode)
            .then(res => res.json())
            .catch(() => {
                showPlans({"msg":"Plan(s) successfully found","plans":[{"_id":"5d9629d2f6986abe7ba608df",plan:{assignment:{}}},{"_id":"5d965c68e593c7c67bc9bfd7",plan:{assignment:{}}},{"_id":"5d965e4be593c7dedac9bfda",plan:{assignment:{}}}]});
            })
            .then(showPlans);
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

const loadablePlan = (plan) => {
    return html`
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
                <h6 class="thumb__heading">#${plan.simple_id || plan._id}</h6>
                <br/>
                <span>${(new Date(plan.startDate)).toString()}</span>
            </figcaption>
            <span style="margin:10px">${(plan.filledBlocks || Object.keys(plan.plan.assignment || {}).length).toLocaleString()} units</span>
        </li>
    </a>`;
}

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
