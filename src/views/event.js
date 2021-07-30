import { svg, html, render } from "lit-html";
import { communitiesFilter, listPlacesForState, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";
import { PlaceMapWithData } from "../components/PlaceMap";
import { geoPath } from "d3-geo";
import { geoAlbersUsaTerritories } from "geo-albers-usa-territories";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import {
  stateForEvent,
  validEventCodes,
  coi_events,
  hybrid_events,
  eventDescriptions,
  longAbout,
} from "../../assets/events/events.js";

let skip = 0, draftskip = 0,
    prevPlans = [],
    prevDrafts = [];

const blockPlans = {
  powercoalition: [9439, 9446],
};

const unitTypes = {
  "pmc-demo": {no: '2011 Wards'},
  pmc: {no: '2011 Wards'},
  'pmc-districts': {no: ['2011 Wards', 'Block Groups']},
  powercoalition: {no: 'Precincts'},
  "open-maps": {no: 'Precincts'},
  "fair-districts-oh": {no: 'Precincts'},
  grns: {no: '2011 Wards'},
  'missouri-mapping': {no: 'Precincts'}
};

const unitCounts = {
  'unca-forsyth': 101,
  centralsan: 5086,
  buncombe: 67,
  'towsonu-baltimore': 653,
  prjusd: 2818,
  'pmc-districts':7078
};

const portal_events = [
  'open-maps',
  'fyi',
];

const proposals_by_event = {
  centralsan: true,
  'pmc-districts': true,
  prjusd: true,
};

export default () => {
    const og_eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    );
    const eventCode = og_eventCode.toLowerCase();

    if (validEventCodes[eventCode]) {
        document.getElementById("eventHeadline").innerText = og_eventCode;
        if (coi_events.includes(eventCode)) {
            document.getElementById("introExplain").innerText = "Map Your Community";
            document.getElementById("introExplain").style.display = "block";
        }

    if (["commoncausepa"].includes(eventCode)) {
       document.getElementById("partnership-icons").style.display = "block";
       document.getElementById("partner-link-a").href = "https://www.commoncause.org/pennsylvania/";
       document.getElementById("partnership-a").src = "/assets/CC_Share_PA.png";
       document.getElementById("partner-link-b").href = "https://www.commoncause.org/";
       document.getElementById("partnership-b").src = "/assets/commoncauselogo.png";
    }
    let loadPartner = (letter, link, img, color) => {
      document.getElementById("partner-link-" + letter).href = link;
      document.getElementById("partnership-" + letter).src = "/assets/partners/" + img;
      if (color) {
        document.getElementById("partnership-" + letter).style.background = color;
      }
    };

        if (["mesaaz", "slo_county", "napa_county", "san_jose", "siskiyou", "redwood", "ventura_county", "yolo_county", "solano_county"].includes(eventCode)) {
            // Redistricting Partners
            document.getElementById("partnership-icons").style.display = "block";
            loadPartner('b', "https://redistrictingpartners.com", "rp.png");

            if (eventCode === "mesaaz") {
              loadPartner('a', "https://www.mesaaz.gov", "mesa.jpeg");
            } else if (eventCode === "slo_county") {
              loadPartner('a', "https://www.slocounty.ca.gov/", "slo.png");
            } else if (eventCode === "napa_county") {
              loadPartner('a', "https://www.countyofnapa.org/", "napa.png", '#252532');
            } else if (eventCode === "san_jose") {
              loadPartner('a', "https://www.sanjoseca.gov/", "sanjose.png", '#043c4b');
            } else if (eventCode === "siskiyou") {
              loadPartner('a', "https://www.co.siskiyou.ca.us/", "siskiyou.png");
            } else if (eventCode === "redwood") {
              loadPartner('a', "https://www.redwoodcity.org/home", 'redwood.jpeg');
            } else if (eventCode === "ventura_county") {
              loadPartner('a', "https://www.ventura.org/", "ventura.png");
            } else if (eventCode === "yolo_county") {
              loadPartner('a', "https://www.yolocounty.org/", "yolo.png", '#375e97');
            } else if (eventCode === "solano_county") {
              loadPartner('a', "https://www.solanocounty.com", "solano.gif");
            }
        } else if (["saccounty", "saccountymap", "sonomaco", "pasadena2021", "sbcounty", "goleta", "marinco", "fresno", "nevadaco", "kingsco", "mercedco", "marinaca", "arroyog", "sanmateoco", "sanbenito", "chulavista", "camarillo", "bellflower", "fresnocity"].includes(eventCode)) {
            // NDC
            document.getElementById("partnership-icons").style.display = "block";
            loadPartner('b', "https://www.ndcresearch.com", "ndc.png");

            if (eventCode === "sonomaco") {
              loadPartner('a', "https://sonomacounty.ca.gov", "sonoma.png");
            } else if (eventCode === "pasadena2021") {
              loadPartner('a', "https://www.cityofpasadena.net", "pasadena.png", "#00275d");
            } else if (eventCode === "sbcounty") {
              loadPartner('a', "https://www.countyofsb.org", "santabarbara.png", "#22a8c4");
            } else if (eventCode === "goleta") {
              loadPartner('a', "https://www.cityofgoleta.org", "goleta.png");
            } else if (eventCode === "marinco") {
              loadPartner('a', "https://www.marincounty.org", "marin.png");
            } else if (eventCode === "marinaca") {
              loadPartner('a', "https://cityofmarina.org", "marina.png");
            } else if (eventCode === "arroyog") {
              loadPartner('a', "http://www.arroyogrande.org", "arroyo.png");
            } else if (eventCode === "fresno") {
              loadPartner('a', "https://www.co.fresno.ca.us", "fresno.png", "#1C385A");
            } else if (eventCode === "fresnocity") {
              loadPartner('a', "https://fresno.gov", "fresno-city.jpeg");
            } else if (eventCode === "nevadaco") {
              loadPartner('a', "https://www.mynevadacounty.com", "ca_nevada.png");
            } else if (eventCode === "sanmateoco") {
              loadPartner('a', "https://www.smcgov.org", "sanmateoco.png");
            } else if (eventCode === "kingsco") {
              loadPartner('a', "https://www.countyofkings.com", "kings.svg", "#142942");
            } else if (eventCode === "mercedco") {
              loadPartner('a', "https://www.co.merced.ca.us", "merced.png");
            } else if (eventCode === "sanbenito") {
              loadPartner('a', "https://www.cosb.us", "sanbenito.svg");
            } else if (eventCode === "camarillo") {
              loadPartner('a', "https://www.ci.camarillo.ca.us", "camarillo.png");
            } else if (eventCode === "chulavista") {
              loadPartner('a', "https://www.chulavistaca.gov", "chulavista.png");
            } else if (eventCode === "bellflower") {
              loadPartner('a', "https://www.bellflower.org", "bellflower.png");
            } else {
              loadPartner('a', "https://www.saccounty.net/Redistricting/Pages/default.aspx", "sacramento.png");
            }
        }

        // document.getElementById("eventCode").innerText = og_eventCode;
        if (eventDescriptions[eventCode]) {
            let desc = document.createElement("div");
            desc.innerHTML = eventDescriptions[eventCode];
            document.getElementById("event-description").prepend(desc);
        }
        if (longAbout[eventCode]) {
            document.getElementById("about-section").style.display = "block";
            document.getElementsByClassName("about-section")[0].style.display = "list-item";
            document.getElementById("about-section-text").innerHTML = longAbout[eventCode].map(p => '<p>' + p + '</p>').join("");
        }
        if(eventCode === "ttt") {
            let title = document.getElementById("districting-options-title");
            render(html`<text class="italic-note">This is a training page for using Districtr to draw districts and map communities.
            You can start in any state and use the tag "TTT" to post here.</text>`, title);
            let map_section = document.getElementById("districting-options");
            render(until(PlaceMapWithData((tgt) => toStateCommunities(tgt, 'ttt')), ""), map_section);
        }

        if (eventCode === "open-maps") {
          // ohio mini-map
          document.getElementById("mini-maps").style.display = "block";
          document.getElementById("districting-options").style.display = "none";
          document.getElementById("districting-options-title").style.display = "none";
          const scale = 3200;
          const translate = [-440, 240];
          const path = geoPath(
              geoAlbersUsaTerritories()
                  .scale(scale)
                  .translate(translate)
          ).pointRadius(9);
          fetch("/assets/oh-zone-map.geojson").then(res => res.json()).then(gj => {
            render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
              <g id="states-group" @mouseleave=${() => {}}>
                ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                    return svg`<path id="x" stroke-width="0"
                        d="${path(feature)}"
                        @click=${(e) => {
                            document.querySelectorAll(".pcommunity")[0].click();
                        }}
                    ></path>`;
                })}
                </g>
              </svg>`, document.getElementById("mini-map-0"));

            render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
              <g id="states-group" @mouseleave=${() => {}}>
                ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                    return svg`<path id="x" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
                        d="${path(feature)}"
                        @click=${(e) => {
                          document.querySelector(".pcommunity." + feature.properties.name).click();
                        }}></path>`;
                })}
                </g>
              </svg>`, document.getElementById("mini-map"));


              render(svg`<svg viewBox="0 0 300 300" style="width:300px; height:300px;">
                <g id="states-group" @mouseleave=${() => {}}>
                  ${gj.features.filter(f => f.geometry.type !== "Point").map((feature, idx) => {
                      return svg`<path id="x" fill="#ccc" stroke-width="0"
                          d="${path(feature)}"
                      ></path>`;
                  })}
                  ${gj.features.filter(f => f.geometry.type === "Point").map((feature, idx) => {
                      return svg`<path class="circle"
                          d="${path(feature)}"
                          @mouseover=${() => {
                            document.getElementById("city-caption").innerText = feature.properties.name;
                          }}
                          @mouseout=${() => {
                            document.getElementById("city-caption").innerText = "";
                          }}
                          @click=${(e) => {
                            document.querySelectorAll(".pcommunity").forEach((block) => {
                                let city = block.innerText.trim().split("\n")[0].toLowerCase();
                                if (feature.properties.name.toLowerCase().includes(city)) {
                                    block.click();
                                }
                            });
                          }}></path>`;
                  })}
                  </g>
                </svg>`, document.getElementById("mini-map-2"));
          });
        }

        if (hybrid_events.includes(eventCode)) {
          document.getElementById("draw-goal").innerText = 'drawing';
        } else {
          document.getElementById("draw-goal").innerText = coi_events.includes(eventCode) ? "drawing your community" : "drawing districts";
        }

        const target = document.getElementById("districting-options");
        if (typeof validEventCodes[eventCode] === 'string') {
            validEventCodes[eventCode] = [validEventCodes[eventCode]];
        }
        if (!validEventCodes[eventCode].length) {
            document.getElementById("communities").style.display = "none";
            document.getElementsByClassName("draw-section")[0].style.display = "none";
            document.getElementsByTagName("p")[0].style.display = "none";
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
                const mydiv = document.createElement('li');
                target.append(mydiv);
                render(placeItems(place, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv);

                if (hybrid_events.includes(eventCode)) {
                    const mydiv2 = document.createElement('li');
                    target.append(mydiv2);
                    render(placeItems({
                      ...place,
                      districtingProblems: [
                          { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                      ]
                    }, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv2);
                }
            });
        });

        let limitNum = 16;
        let eventurl = (window.location.hostname === "localhost")
                    ? "/assets/sample_event.json?"
                    : (`/.netlify/functions/eventRead?skip=0&limit=${limitNum + 1}&event=${eventCode}`);

        let showPlans = (data, drafts = false) => {
            let loadExtraPlans = (data.plans.length > limitNum) || window.location.hostname.includes("localhost");
            if (loadExtraPlans) {
                data.plans.pop();
            }
            // hide at start
            if (drafts && draftskip == 0)
              data.plans = [];
            drafts
              ? prevDrafts = prevDrafts.concat(data.plans.filter(p => !((blockPlans[eventCode] || []).includes(p.simple_id))))
              : prevPlans = prevPlans.concat(data.plans.filter(p => !((blockPlans[eventCode] || []).includes(p.simple_id))));
            const plans = [{
                title: (eventCode === "missouri-mapping" ? "What community maps can look like" :
                (drafts ? "Works in Progress" : "Public Gallery")),
                plans: drafts ? prevDrafts : prevPlans,
            }];
            let pinwheel = drafts ? "event-pinwheel-drafts" : "event-pinwheel";
            let button = drafts ? "loadMoreDrafts" : "loadMorePlans";
            let fetchurl = drafts ? eventurl + "&type=draft" : eventurl;
            if (drafts) // once clicked once no longer hide them!
              fetchurl.replace("limit=0", `limit=${limitNum + 1}`);

            render(html`
                ${plansSection(plans, eventCode)}
                ${loadExtraPlans ?
                  html`<button id="${button}" @click="${(e) => {
                      document.getElementById(pinwheel).style.display = "block";
                      document.getElementById(button).disabled = true;
                      fetch(fetchurl.replace("skip=0", `skip=${drafts ? draftskip+limitNum : skip+limitNum}`)).then(res => res.json()).then(d => {
                        drafts ? draftskip += limitNum : skip += limitNum;
                        document.getElementById(pinwheel).style.display = "none";
                        document.getElementById(button).disabled = false;
                        showPlans(d, drafts);
                      });
                  }}">Load ${drafts ? (draftskip == 0 ? "Drafts" : "More Drafts" ) : "More Plans"}</button>
                  ${loadExtraPlans ? html`<img id="${pinwheel}" src="/assets/pinwheel2.gif" style="display:none"/>` : ""}`
                : ""}
            `, drafts ? document.getElementById("drafts") : document.getElementById("plans"));

            if (proposals_by_event[eventCode]) {
                fetch(`/assets/plans/${eventCode}.json`).then(res => res.json()).then(sample => {
                    render(plansSection([{ title: 'Sample plans', plans: sample.plans, desc: (sample.description ? sample.description : null) }], eventCode, true), document.getElementById("proposals"));
                });
            } else {
                document.getElementById("sample_plan_link").style.display = "none";
            }
        }

        fetch(eventurl).then(res => res.json()).then(showPlans);
        console.log(eventurl)
        fetch((eventurl + "&type=draft").replace(`limit=${limitNum + 1}`, "limit=0")).then(res => res.json()).then(p => showPlans(p, true))
    } else {
        const target = document.getElementById("districting-options");
        render("Tag or Organization not recognized", target);
    }
};

const plansSection = (plans, eventCode, isProfessionalSamples) =>
    plans.map(
        ({ title, plans, desc }) => html`
            <section id="${isProfessionalSamples ? "sample" : "shared"}" class="place__section">
                <h2>${title}</h2>
                ${(isProfessionalSamples || !proposals_by_event[eventCode])
                  ? html`<p>
                    ${(["saccounty", "saccountymap"].includes(eventCode) || !plans.length)
                      ? "As maps are submitted they will appear below, and you will be able to click on any of the maps to open it in Districtr."
                      : "Click on any of the maps below to open it in Districtr."}
                </p>` : null}
                ${desc ? html`<h4>${desc}</h4>` : ""}
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
        districtOff = !coi_events.includes(eventCode) && !hybrid_events.includes(eventCode) && (districtCount < districtGoal),
        unitOff = !coi_events.includes(eventCode) && !hybrid_events.includes(eventCode) && unitCounts[eventCode] && (unitCount < unitCounts[eventCode]);

    let screenshot = plan.screenshot2 || plan.screenshot;
    let urlcode = eventCode;
    if (portal_events.includes(eventCode)) {
      urlcode += '&portal';
    }

    return html`
    <a href="/edit/${plan.simple_id || plan._id}?event=${urlcode}">
        <li class="plan-thumbs__thumb">
            ${(screenshot && screenshot.length > 60 && screenshot.indexOf("data") === 0)
                ? html`<img
                    class="thumb__img"
                    src="${screenshot}"
                    alt="Districting Plan ${plan.simple_id}"
                />`
                : ''
            }
            <figcaption class="thumb__caption">
                <h6 class="thumb__heading">${plan.planName || ''}
                      <br/>
                      ID: ${plan.simple_id || plan._id}</h6>
                <br/>
                ${(plan.isScratch ? html`<h4 style="font-style: italic">Draft Plan</h4>` : "")}
                <span>
                  ${plan.plan.place.name || ""}
                  <br/>
                  ${(plan.plan.problem.type === "community")
                    ? "Communities of Interest"
                    : plan.plan.problem.pluralNoun
                  }
                  <br/>
                  from ${plan.plan.units.name}
                </span>
                <br/>
                ${isProfessionalSamples ? "" : html`<span>Updated<br/>
                      ${(new Date(plan.startDate)).toLocaleString()}</span>`}
            </figcaption>
            ${(coi_events.includes(eventCode) || isProfessionalSamples)
                ? null
                : html`
                  <span style="margin:10px">
                      ${(coi_events.includes(eventCode) || districtGoal == 250) ? "" : (districtCount + "/" + districtGoal + " districts")}
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

function toStateCommunities(s, eventCode) {
    //const url = window.location.origin + '/' + s.properties.NAME.toLowerCase().replace(" ", "-") + "?mode=coi";
    //window.location.assign(url);
    // let place;
    // place.districtingProblems = [
    //   { type: "community", numberOfParts: 250, pluralNoun: "Community" }
    // ];
    let show_just_communities = true;
    let tgt = document.getElementById('districting-options');
    console.log(listPlaces(null, s.properties.NAME))
    //render(html`<div style="display:block"><h4 @click="${() => console.log("Hello")/**render(PlaceMapWithData((t) => toStateCommunities(t, 'ttt')), tgt)**/}">Back to the map</h4></div>`, tgt)
    render("", tgt)
    listPlaces(null, s.properties.NAME).then(items => {
      let placesList = items.filter(place => !place.limit || show_just_communities)
          .map(communitiesFilter)
      let lstdiv = document.createElement('div');
      tgt.append(lstdiv)
      placesList.forEach(place => {
        place.districtingProblems = [
            { type: "community", numberOfParts: 250, pluralNoun: "Community" }
          ]
          const mydiv = document.createElement('li');
          lstdiv.append(mydiv);
          render(placeItems(place, startNewPlan, eventCode, portal_events.includes(eventCode)), mydiv);
      })
    });
}
