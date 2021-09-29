import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";
import { loadPlanFromURL, loadPlanFromJSON, navigateTo, savePlanToStorage } from "../routes";
import Button from "../components/Button";
import PlanUploader from "../components/PlanUploader";
import { PlaceMapWithData } from "../components/PlaceMap";

let available_plans = []

export default () => {
    fetch("/assets/data/landing_pages.json?v=2")
        .then(response => response.json()).then(data => {
            // build list of available plans
            for (let st of data) {
                let ref = uspost[st.state];
                for (let sec of st.sections) {
                    if (sec.type == 'plans' && sec.ref == ref) {
                        available_plans.push(st.state);
                        break;
                    }
                }
            }
            // Build Go Button and Plan Uploader
            let go = new Button(() =>{
                    let url = document.getElementById("shareable-url").value;
                    let plan = loadPlan(url);
                    plan.then(context => {
                        savePlanToStorage(context);
                        navigateTo("/eval");
                    });
                },
                { label: "Go.", hoverText: "Evaluate the selected plan." });
            let upload = new PlanUploader(fileContent => {
                loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
                        savePlanToStorage(context);
                        navigateTo("/eval");
                    });
                })

            let from_link = html`<div class="modal-item" id="url">
                    <p>
                        Paste the shareable URL or plan code for an existing Districtr
                        plan.
                    </p>
                    <input type="url" id="shareable-url">
                    <div class="go-button">${go}</div>
                </div>`
            render(from_link, document.getElementById('link-upload'));
            render(upload.render(), document.getElementById("json-upload"));

            // Build map for clicking for loadable plans
            // let plans_tgt = document.getElementById('loadable-plans');
            // render(until(PlaceMapWithData((f) => showPlans(f, data, plans_tgt), available_plans), ""), document.getElementById('map-div'));
        });
}

/** Plan Loading */
function loadPlan(url) {
    // load a test plan if developing
    if (window.location.href.includes("localhost:") && url == "")
        return loadPlanFromURL("/assets/mi-plans/state_house.json?v=2");
    let districtr_id = url.split('/')[url.split('/').length - 1];
    return fetch('https://districtr.org/.netlify/functions/planRead?id=' + districtr_id)
    .then(res => res.json())
    .then(loadPlanFromJSON);
}

/** Helper functions */
const plansSection = (plans, place) =>
    plans.map(
        ({ title, plans }) => html`
            <section class="place__section">
                ${loadablePlans(plans, place)}
            </section>
        `
    );

const loadablePlans = (plans, place) =>
    html`
        <ul class="plan-thumbs">
            ${plans.map(p => loadablePlan(p, place))}
        </ul>
    `;


const loadablePlan = (plan, place) => html`
        <a href="eval?url=/assets/${place}-plans/${plan.id}.json?v=2">
            <li class="plan-thumbs__thumb">
                <img
                    class="thumb__img"
                    src="/assets/${place}-plans/${plan.id}.png?v=2"
                    alt="Districting Plan ${plan.id}"
                />
                <figcaption class="thumb__caption">
                    <h6 class="thumb__heading">${plan.name || plan.id}</h6>
                </figcaption>
            </li>
        </a>
`;

function showPlans(feature, data, tgt) {
    let curState = feature.properties.NAME;
    if (!curState)
        return;
    if (curState == "DC")
        curState = "Washington, DC";
    var stateData = data.filter(st => st.state === curState)[0];
    let plans = [], ref = uspost[curState];
    for (let section of stateData.sections)
        if (section.type == 'plans' && section.ref == ref)
            plans = plans.concat(section.plans)
    if (plans.length > 0 && available_plans.includes(curState))
        render(plansSection(plans, ref), tgt);
        window.location.hash = "#loadable-plans-header"
}

const uspost = {
    "Alabama": "al",
    "Alaska": "ak",
    "Arizona": "az",
    "Arkansas": "ar",
    "California": "ca",
    "Colorado": "co",
    "Connecticut": "ct",
    "Delaware": "de",
    "Florida": "fl",
    "Georgia": "ga",
    "Hawaii": "hi",
    "Idaho": "id",
    "Illinois": "il",
    "Indiana": "in",
    "Iowa": "ia",
    "Kansas": "ks",
    "Kentucky": "ky",
    "Louisiana": "la",
    "Maine": "me",
    "Maryland": "md",
    "Massachusetts": "ma",
    "Michigan": "mi",
    "Minnesota": "mn",
    "Mississippi": "ms",
    "Missouri": "mo",
    "Montana": "mt",
    "Nebraska": "ne",
    "Nevada": "nv",
    "New Hampshire": "nh",
    "New Jersey": "nj",
    "New Mexico": "nm",
    "New York": "ny",
    "North Carolina": "nc",
    "North Dakota": "nd",
    "Ohio": "oh",
    "Oklahoma": "ok",
    "Oregon": "or",
    "Pennsylvania": "pa",
    "Puerto Rico": "pr",
    "Rhode Island": "ri",
    "South Carolina": "sc",
    "South Dakota": "sd",
    "Tennessee": "tn",
    "Texas": "tx",
    "Utah": "ut",
    "Vermont": "vt",
    "Virginia": "va",
    "Washington": "wa",
    "Washington, DC": "dc",
    "West Virginia": "wv",
    "Wisconsin": "wi",
    "Wyoming": "wy"
  };
