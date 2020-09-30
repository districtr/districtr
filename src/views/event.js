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
  'cc-nm-abq': 'new_mexico_bg',
};

const unitCounts = {
  'unca-forsyth': 101,
};

const coi_events = [
  "fyi",
  'common cause md ss',
  'commoncause md ss',
  'cc-md-ss',
  'cc md ss',
  'cc-nm-abq',
];

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
  'unca-forsyth': 'Welcome to your class page UNC Asheville students! We\'re excited for you to start exploring Forsyth County with Districtr. <a href="/guide">Click here</a> for a tutorial.',

  'common cause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'commoncause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-md-ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-nm-abq': 'Welcome to the event page for the Common Cause New Mexico project!'
};

const longAbout = {
  'cc-nm-abq': ["MGGG has partnered with Common Cause, a nonprofit good-government organization championing voting rights and redistricting reform, to collect Communities of Interest in Albuquerque, New Mexico. Participants in Albuquerque will join the event virtually to engage in a discussion about community led by National Redistricting Manager, Dan Vicuña, and Census and Mass Incarceration Project Manager, Keshia Morris.",
      "The team will use Districtr, a free webtool developed by MGGG at Tufts University, to map important places and community boundaries. The data for this event were obtained from the US Census Bureau. The block group shapefiles were downloaded from the Census's TIGER/Line Shapefiles, and demographic information from the 2010 Decennial Census was downloaded at the block level from the Census API.",
      "We welcome questions and inquiries about the tool and our work. Reach out to us at <a href=\"mailto:contact@mggg.org\">contact@mggg.org</a> if you are interested in working with us."]
};

export default () => {
    const og_eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    ).replace(/_/g, '-');
    const eventCode = og_eventCode.toLowerCase();

    if (validEventCodes[eventCode]) {
        document.getElementById("eventHeadline").innerText = og_eventCode;
        // document.getElementById("eventCode").innerText = og_eventCode;
        if (eventDescriptions[eventCode]) {
            document.getElementById("event-description").innerHTML = eventDescriptions[eventCode];
        }
        if (longAbout[eventCode]) {
            document.getElementById("about-section").style.display = "block";
            document.getElementById("about-section-text").innerHTML = longAbout[eventCode].map(p => '<p>' + p + '</p>').join("");
        }

        document.getElementById("draw-goal").innerText = coi_events.includes(eventCode) ? "mapping your community" : "drawing districts";

        listPlacesForState(validEventCodes[eventCode], coi_events.includes(eventCode)).then(places => {
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
                title: coi_events.includes(eventCode) ? "Shared maps" : "Shared plans",
                plans: data.plans
            }];
            render(plansSection(plans, eventCode), document.getElementById("plans"));
        }

        let eventurl = (window.location.hostname === "localhost")
                    ? "/assets/sample_event.json"
                    : ("/.netlify/functions/eventRead?event=" + eventCode)

        fetch(eventurl).then(res => res.json()).then(showPlans);
    } else {
        render("Event code not recognized", target);
    }
};

const plansSection = (plans, eventCode) =>
    plans.map(
        ({ title, plans }) => html`
            <section id="shared" class="place__section">
                <h2>${title}</h2>
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
                  .map(z => (z && z.length) ? z[0] : z)
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
                <h6 class="thumb__heading">${plan.planName || ''}
                      <br/>
                      Plan ID: ${plan.simple_id || plan._id}</h6>
                <br/>
                <span>Last updated<br/>
                ${(new Date(plan.startDate)).toLocaleString()}</span>
            </figcaption>
            <span style="margin:10px">
                ${coi_events.includes(eventCode) ? "" : (districtCount + "/" + districtGoal + " districts")}
                ${unitOff ? html`<br/>` : null }
                ${unitOff ? (Math.floor(100 * unitCount/unitCounts[eventCode]) + "% of units") : null}
            </span>
            ${coi_events.includes(eventCode)
                ? null
                : html`<span style="margin:10px;margin-top:0;">
                    ${(districtOff || unitOff)
                        ? "Incomplete"
                        : "Complete"}
                  </span>`
            }
        </li>
    </a>`;
}

const districtingOptions = (places, eventCode) =>
    html`
        <ul class="places-list places-list--columns">
            ${placeItems(places[0], startNewPlan, eventCode)}
        </ul>
    `;
