import { html, render } from "lit-html";
import { listPlacesForState, getUnits, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";

const validEventCodes = {
  test: 'pennsylvania',
  fyi: 'forsyth_nc',
  'unca-forsyth': 'forsyth_nc',
  'common cause md ss': 'maryland',
  'commoncause md ss': 'maryland',
  'cc-md-ss': 'maryland',
  'cc md ss': 'maryland',
};

const unitCounts = {
  'unca-forsyth': 101,
  fyi: 101,
  'common cause md ss': 1809,
  'commoncause md ss': 1809,
  'cc-md-ss': 1809,
  'cc md ss': 1809,
};

const coi_events = [
  "fyi",
  'common cause md ss',
  'commoncause md ss',
  'cc-md-ss',
  'cc md ss',
];

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
  'unca-forsyth': 'Welcome to your class page UNC Asheville students! We\'re excited for you to start exploring Forsyth County with Districtr. <a href="/guide">Click here</a> for a tutorial.',

  'common cause md ss': 'Welcome to the event page for Common Cause Maryland project!',
  'commoncause md ss': 'Welcome to the event page for Common Cause Maryland project!',
  'cc-md-ss': 'Welcome to the event page for Common Cause Maryland project!',
  'cc md ss': 'Welcome to the event page for Common Cause Maryland project!',
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
            document.getElementById("event-description").innerHTML = eventDescriptions[eventCode];
        }

        document.getElementById("draw-goal").innerText = coi_events.includes(eventCode) ? "mapping your community" : "drawing districts";

        listPlacesForState(validEventCodes[eventCode]).then(places => {
            const target = document.getElementById("districting-options");
            if (coi_events.includes(eventCode)) {
                // render(html`<div class="place-info">Identify a community</div>`, target);
                places[0].districtingProblems = [
                    { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                ];
            }
            render(districtingOptions(places, eventCode), target);
        });

        let showPlans = (data) => {
            const plans = [{
                title: coi_events.includes(eventCode) ? "Submitted communities" : "Submitted plans",
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
                    Click on any of the maps below to open it in
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
    let completness = null,
        unitCount = plan.filledBlocks || Object.keys(plan.plan.assignment || {}).length,
        districtCount = (new Set(
            Object.values(plan.plan.assignment || {})
                  .filter(z => ![null, "null", undefined, "undefined", -1].includes(z))
        )).size,
        districtGoal = plan.plan.problem.numberOfParts,
        districtOff = !coi_events.includes(eventCode) && (districtCount < districtGoal),
        unitOff = !coi_events.includes(eventCode) && unitCounts[eventCode] && (unitCount < unitCounts[eventCode]);

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
                <span>${(new Date(plan.startDate)).toLocaleString()}</span>
            </figcaption>
            ${coi_events.includes(eventCode)
                ? null
                : html`<span style="margin:10px">
                    ${(districtOff || unitOff)
                        ? "Incomplete"
                        : "Complete"}
                  </span>`
            }
            <span style="margin:10px">
                ${districtOff ? (districtCount + "/" + districtGoal + " districts") : null}
                ${unitOff ? html`<br/>` : null }
                ${unitOff ? (unitCount + "/" + unitCounts[eventCode] + " units") : null}
            </span>
        </li>
    </a>`;
}

const districtingOptions = (places, eventCode) =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItems(places[0], startNewPlan, eventCode)}
        </ul>
    `;
