import { html, render } from "lit-html";
import { listPlacesForState, getUnits, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";

const validEventCodes = {
  test: 'pennsylvania',
  fyi: 'forsyth_nc',
  'unca-forsyth': 'forsyth_nc'
};

const unitCounts = {
  'unca-forsyth': 101,
};

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
  'unca-forsyth': 'Welcome to your class page UNC Ashville students! We\'re excited for you to start exploring Forsyth County with Districtr. Click here for a tutorial.',
};

export default () => {
    const eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    ).toLowerCase().replace(/_/g, '-');

    if (validEventCodes[eventCode]) {
        document.getElementById("eventHeadline").innerText = eventCode;
        document.getElementById("eventCode").innerText = eventCode;
        if (eventDescriptions[eventCode]) {
            document.getElementById("event-description").innerText = eventDescriptions[eventCode];
        }

        listPlacesForState(validEventCodes[eventCode]).then(places => {
            const target = document.getElementById("districting-options");
            render(districtingOptions(places), target);
        });

        let showPlans = (data) => {
            const plans = [{
                title: "Submitted plans",
                plans: data.plans
            }];
            render(plansSection(plans, eventCode), document.getElementById("plans"));
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

const plansSection = (plans, eventCode) =>
    plans.map(
        ({ title, plans }) => html`
            <section class="place__section">
                <h3>${title}</h3>
                <p>
                    Click on any of the districting plans below to open it in
                    Districtr.
                </p>
                ${loadablePlans(plans, eventCode)}
            </section>
        `
    );

const loadablePlans = (plans, eventCode) =>
    html`
        <ul class="plan-thumbs">
            ${plans.map((p, i) => loadablePlan(p, eventCode))}
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

const loadablePlan = (plan, eventCode) => {
    return html`
    <a href="/edit/${plan.simple_id || plan._id}?event=${eventCode}">
        <li class="plan-thumbs__thumb">
            ${plan.screenshot
                ? html`<img
                    class="thumb__img"
                    src="${plan.screenshot}"
                    alt="Districting Plan ${plan.simple_id}"
                />`
                : ''
            }
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.planName || ''} #${plan.simple_id || plan._id}</h6>
                <br/>
                <span>${(new Date(plan.startDate)).toString()}</span>
            </figcaption>
            <span style="margin:10px">${(unitCounts[eventCode]
                ? (Object.keys(plan.plan.assignment || {}).length).toLocaleString() + '/' + unitCounts[eventCode].toLocaleString()
                : plan.filledBlocks || Object.keys(plan.plan.assignment || {}).length).toLocaleString()}
            units</span>
        </li>
    </a>`;
}

const districtingOptions = places =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItems(places[0], startNewPlan)}
        </ul>
    `;
