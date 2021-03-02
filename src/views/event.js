import { html, render } from "lit-html";
import { listPlacesForState, getUnits, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";

const stateForEvent = {
  test: 'Pennsylvania',
  fyi: 'North Carolina',
  'unca-forsyth': 'North Carolina',
  'common cause md ss': 'Maryland',
  'commoncause md ss': 'Maryland',
  'cc-md-ss': 'Maryland',
  'cc md ss': 'Maryland',
  'cc-nm-abq': 'New Mexico',
  centralsan: 'California',
  'mggg-nm': 'New Mexico',
  'pmc-demo': 'Wisconsin',
  powercoalition: 'Louisiana',
  'open-maps': 'Ohio',
  'fair-districts-oh': 'Ohio',
  'colorado-cc': 'Colorado',
};

const validEventCodes = {
  test: 'pennsylvania',
  fyi: 'forsyth_nc',
  'unca-forsyth': 'forsyth_nc',
  'common cause md ss': 'maryland',
  'commoncause md ss': 'maryland',
  'cc-md-ss': 'maryland',
  'cc md ss': 'maryland',
  'cc-nm-abq': 'new_mexico',
  centralsan: 'ccsanitation2',
  'mggg-nm': ['new_mexico', 'new_mexico_bg', 'santafe'],
  'pmc-demo': ['wisconsin2020', 'wisconsin'],
  powercoalition: 'batonrouge',
  'open-maps': ['ohio', 'akroncanton', 'cincinnati', 'clevelandeuclid', 'columbus', 'dayton', 'limaoh', 'mansfield', 'portsmouthoh', 'toledo', 'youngstown'],
  'fair-districts-oh': ['ohio', 'akroncanton', 'cincinnati', 'clevelandeuclid', 'columbus', 'dayton', 'limaoh', 'mansfield', 'portsmouthoh', 'toledo', 'youngstown'],
  'colorado-cc': 'colorado',
};

const blockPlans = {
  powercoalition: [9439, 9446],
};

const unitTypes = {
  "pmc-demo": {no: '2011 Wards'},
  powercoalition: {no: 'Precincts'},
  "open-maps": {no: 'Precincts'},
  "fair-districts-oh": {no: 'Precincts'},
};

const unitCounts = {
  'unca-forsyth': 101,
  centralsan: 5086,
};

const coi_events = [
  "fyi",
  'common cause md ss',
  'commoncause md ss',
  'cc-md-ss',
  'cc md ss',
  'cc-nm-abq',
  // 'santafe',
  'mggg-nm',
  'pmc-demo',
  'powercoalition',
  'open-maps',
  'fair-districts-oh',
  'colorado-cc',
];

const eventDescriptions = {
  test: 'this is a test of the event descriptions',
  'unca-forsyth': 'Welcome to your class page UNC Asheville students! We\'re excited for you to start exploring Forsyth County with Districtr. <a href="/guide">Click here</a> for a tutorial.',

  'common cause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'commoncause md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-md-ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc md ss': 'Welcome to the event page for the Common Cause Maryland project!',
  'cc-nm-abq': 'Welcome to the event page for the Common Cause New Mexico project!',
  centralsan: 'Welcome to the event page for the Central Contra Costa County Sanitary District. This page uses Districtr, a community web tool provided by the MGGG Redistricting Lab. <a href="/guide">Click here</a> for a Districtr tutorial.',
  'mggg-nm': 'Welcome to the event page for the MGGG - New Mexico demo!',
  'pmc-demo': 'Welcome to the COI collection page for Wisconsin (DEMO)',
  powercoalition: 'Welcome to the greater Baton Rouge event page for the <a href="https://powercoalition.org/">Power Coalition</a>. This page is set up to let you identify your communities of interest.<br/><br/>Show us the important places and tell us the stories that you want the mapmakers to see when they draw the lines!',
  'open-maps': 'Welcome to the event page for Open MAPS!',
  'fair-districts-oh': 'Welcome to the event page for Fair Districts Ohio!',
  'colorado-cc': 'Welcome to the event page for Colorado Common Cause!',
};

const longAbout = {
  'cc-nm-abq': ["MGGG has partnered with Common Cause, a nonprofit good-government organization championing voting rights and redistricting reform, to collect Communities of Interest in Albuquerque, New Mexico. Participants in Albuquerque will join the event virtually to engage in a discussion about community led by National Redistricting Manager, Dan Vicuña, and Census and Mass Incarceration Project Manager, Keshia Morris.",
      "The team will use Districtr, a free webtool developed by MGGG at Tufts University, to map important places and community boundaries. The data for this event were obtained from the US Census Bureau. The block group shapefiles were downloaded from the Census's TIGER/Line Shapefiles, and demographic information from the 2010 Decennial Census was downloaded at the block level from the Census API.",
      "We welcome questions and inquiries about the tool and our work. Reach out to us at <a href=\"mailto:contact@mggg.org\">contact@mggg.org</a> if you are interested in working with us."],
  centralsan: [
    "The <a href='https://www.centralsan.org/'>Central Contra Costa Sanitary District</a> (Central San) is transitioning from an at-large election system to an area-based election system. Under the current at-large election system, all five members of the Board of Directors are chosen by constituents from the District’s entire service area. Under area-based elections, the District will be divided into five separate election areas—called “divisions”—and voters residing in each area will select one representative to serve on the Board.",
    "Central San invites all residents of the District to provide input on the options under consideration, and to submit their own maps for consideration."],
  "pmc-demo": "",
};

const proposals_by_event = {
  centralsan: true
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

        document.getElementById("draw-goal").innerText = coi_events.includes(eventCode) ? "drawing your community" : "drawing districts";

        const target = document.getElementById("districting-options");
        if (typeof validEventCodes[eventCode] === 'string') {
            validEventCodes[eventCode] = [validEventCodes[eventCode]];
        }

        listPlacesForState(stateForEvent[eventCode], coi_events.includes(eventCode)).then(places => {
            validEventCodes[eventCode].forEach(placeID => {
                let place = places.find(p => p.id === placeID);
                if (coi_events.includes(eventCode) || coi_events.includes(placeID)) {
                    place.districtingProblems = [
                        { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                    ];
                }
                if (unitTypes[eventCode]) {
                    if (unitTypes[eventCode].no) {
                        // block-list
                        place.units = place.units.filter(u => !unitTypes[eventCode].no.includes(u.name));
                    } else if (unitTypes[eventCode].yes) {
                        // allow-list
                        place.units = place.units.filter(u => unitTypes[eventCode].yes.includes(u.name));
                    }
                }
                const mydiv = document.createElement('div');
                target.append(mydiv);
                render(placeItems(place, startNewPlan, eventCode), mydiv);
            });
        });

        let showPlans = (data) => {
            const plans = [{
                title: "Community-submitted maps",
                plans: data.plans.filter(p => !((blockPlans[eventCode] || []).includes(p.simple_id)))
            }];
            render(plansSection(plans, eventCode), document.getElementById("plans"));

            if (proposals_by_event[eventCode]) {
                fetch(`/assets/plans/${eventCode}.json`).then(res => res.json()).then(sample => {
                    render(plansSection([{ title: 'Sample plans', plans: sample.plans }], eventCode, true), document.getElementById("proposals"));
                });
            } else {
                document.getElementById("sample_plan_link").style.display = "none";
            }
        }

        let eventurl = (window.location.hostname === "localhost")
                    ? "/assets/sample_event.json"
                    : ("/.netlify/functions/eventRead?event=" + eventCode)

        fetch(eventurl).then(res => res.json()).then(showPlans);
    } else {
        render("Tag or Organization not recognized", target);
    }
};

const plansSection = (plans, eventCode, isProfessionalSamples) =>
    plans.map(
        ({ title, plans }) => html`
            <section id="${isProfessionalSamples ? "sample" : "shared"}" class="place__section">
                <h2>${title}</h2>
                ${(isProfessionalSamples || !proposals_by_event[eventCode])
                  ? html`<p>
                    Click on any of the maps below to open it in
                    Districtr.
                </p>` : null}
                <ul class="plan-thumbs">
                    ${plans.map((p, i) => loadablePlan(p, eventCode, isProfessionalSamples))}
                </ul>
            </section>
        `
    );

const loadablePlan = (plan, eventCode, isProfessionalSamples) => {
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
            ${(plan.screenshot && plan.screenshot.length > 60)
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
                ${isProfessionalSamples ? "" : html`<span>Last updated<br/>
                      ${(new Date(plan.startDate)).toLocaleString()}</span>`}
            </figcaption>
            ${(coi_events.includes(eventCode) || isProfessionalSamples)
                ? null
                : html`
                  <span style="margin:10px">
                      ${coi_events.includes(eventCode) ? "" : (districtCount + "/" + districtGoal + " districts")}
                      ${unitOff ? html`<br/>` : null }
                      ${unitOff ? (Math.floor(100 * unitCount/unitCounts[eventCode]) + "% of units") : null}
                  </span>
                  <span style="margin:10px;margin-top:0;">
                    ${(districtOff || unitOff)
                        ? "Incomplete"
                        : "Complete"}
                  </span>`
            }
        </li>
    </a>`;
}
