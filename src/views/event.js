import { svg, html, render } from "lit-html";
import { communitiesFilter, listPlacesForState, placeItems } from "../components/PlacesList";
import { startNewPlan } from "../routes";
import { PlaceMapWithData } from "../components/PlaceMap";
import { geoPath } from "d3-geo";
import { geoAlbersUsaTerritories } from "geo-albers-usa-territories";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import allEvents from "../../assets/events.json";

let skip = 0, draftskip = 0,
    prevPlans = [],
    prevDrafts = [],
    eventInfo = {};

export default () => {
    const og_eventCode = ((window.location.hostname === "localhost")
        ? window.location.search.split("event=")[1].split("&")[0]
        : window.location.pathname.split("/").slice(-1)[0]
    );
    const eventCode = og_eventCode.toLowerCase();
    eventInfo = allEvents.find(evt => evt.code === eventCode);
    if (!eventInfo) {
      // did not have data for this event
      const target = document.getElementById("districting-options");
      render("Tag or Organization not recognized", target);

      return console.error("Did not find event with code: " + eventCode);
    }

    // display title and info depending on Plan, COI, or hybrid event
    document.getElementById("eventHeadline").innerText = og_eventCode;
    if (eventInfo.coi) {
        document.getElementById("introExplain").innerText = "Map Your Community";
        document.getElementById("introExplain").style.display = "block";
    }
    if (eventInfo.hybrid) {
        document.getElementById("draw-goal").innerText = 'drawing';
    } else {
        document.getElementById("draw-goal").innerText = eventInfo.coi ? "drawing your community" : "drawing districts";
    }

    // display description and footer / about
    if (eventInfo.description) {
        let desc = document.createElement("div");
        desc.innerHTML = eventInfo.description;
        document.getElementById("event-description").prepend(desc);
    }
    if (eventInfo.about) {
        document.getElementById("about-section").style.display = "block";
        document.getElementsByClassName("about-section")[0].style.display = "list-item";
        document.getElementById("about-section-text").innerHTML = eventInfo.about;
    }

    // display partner info
    if (eventInfo["partnerA"] || eventInfo["partnerB"] || eventInfo["partnerAlink"] || eventInfo["partnerBlink"]) {
      document.getElementById("partnership-icons").style.display = "block";
    }
    if (eventInfo["partnerB"] === "RP") {
        document.getElementById("partner-link-b").href = "https://redistrictingpartners.com";
        document.getElementById("partnership-b").src = "/assets/partners-rp.png";
    } else if (eventInfo["partnerB"] === "NDC") {
        document.getElementById("partnership-b").src = "/assets/partners-ndc.png";
        document.getElementById("partner-link-b").href = "https://www.ndcresearch.com/";
    }
    if (eventInfo["partnerAlink"]) {
        console.log(eventInfo);
        document.getElementById("partner-link-a").href = eventInfo["partnerAlink"];
        document.getElementById("partnership-a").src = `/assets/${eventInfo["partnerAimage"]}`;
    }
    if (eventInfo["partnerBlink"]) {
        document.getElementById("partner-link-b").href = eventInfo["partnerBlink"];
        document.getElementById("partnership-b").src = `/assets/${eventInfo["partnerBimage"]}`;
    }

    if (eventCode === "ttt") {
        // special selections for TTT event
        let title = document.getElementById("districting-options-title");
        render(html`<text class="italic-note">This is a training page for using Districtr to draw districts and map communities.
        You can start in any state and use the tag "TTT" to post here.</text>`, title);
        let map_section = document.getElementById("districting-options");
        render(until(PlaceMapWithData((tgt) => toStateCommunities(tgt, 'ttt')), ""), map_section);
    } else if (eventCode === "open-maps") {
        // special mini-map for Ohio open-maps event
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

      // fetch and render card options
      const target = document.getElementById("districting-options");
      if (typeof eventInfo.module === 'string') {
          eventInfo.module = [eventInfo.module];
      }
      if (!eventInfo.module.length) {
          document.getElementById("communities").style.display = "none";
          document.getElementsByClassName("draw-section")[0].style.display = "none";
          document.getElementsByTagName("p")[0].style.display = "none";
      }

      listPlacesForState(eventInfo.state, eventInfo.coi).then(places => {
          eventInfo.module.forEach(placeID => {
              let place = places.find(p => p.id === placeID);
              if (eventInfo.coi) {
                  place.districtingProblems = [
                      { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                  ];
              }
              // if (unitTypes[eventCode]) {
              //     if (unitTypes[eventCode].no) {
              //         // block-list
              //         place.units = place.units.filter(u => !unitTypes[eventCode].no.includes(u.name));
              //     } else if (unitTypes[eventCode].yes) {
              //         // allow-list
              //         place.units = place.units.filter(u => unitTypes[eventCode].yes.includes(u.name));
              //     }
              // }
              const mydiv = document.createElement('li');
              target.append(mydiv);
              render(placeItems(place, startNewPlan, eventCode, eventInfo.direct_to_portal), mydiv);

              if (eventInfo.hybrid) {
                  const mydiv2 = document.createElement('li');
                  target.append(mydiv2);
                  render(placeItems({
                    ...place,
                    districtingProblems: [
                        { type: "community", numberOfParts: 250, pluralNoun: "Community" }
                    ]
                  }, startNewPlan, eventCode, eventInfo.direct_to_portal), mydiv2);
              }
          });
      });

      // show user-submitted plans in pages
      let limitNum = 16;
      let eventurl = (window.location.hostname === "localhost")
                  ? "/assets/sample_event.json"
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
            ? prevDrafts = prevDrafts.concat(data.plans.filter(p => !((eventInfo.block || []).includes(p.simple_id))))
            : prevPlans = prevPlans.concat(data.plans.filter(p => !((eventInfo.block || []).includes(p.simple_id))));
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

          if (eventInfo.proposals) {
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
};

const plansSection = (plans, eventCode, isProfessionalSamples) =>
    plans.map(
        ({ title, plans, desc }) => html`
            <section id="${isProfessionalSamples ? "sample" : "shared"}" class="place__section">
                <h2>${title}</h2>
                ${(isProfessionalSamples || !eventInfo.proposals)
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
        districtOff = !eventInfo.coi && !eventInfo.hybrid && (districtCount < districtGoal),
        unitOff = !eventInfo.coi && !eventInfo.hybrid && eventInfo.unitCount && (unitCount < eventInfo.unitCount);

    let screenshot = plan.screenshot2 || plan.screenshot;
    let urlcode = eventCode;
    if (eventInfo.direct_to_portal) {
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
            ${(eventInfo.coi || isProfessionalSamples)
                ? null
                : html`
                  <span style="margin:10px">
                      ${(eventInfo.coi || districtGoal == 250) ? "" : (districtCount + "/" + districtGoal + " districts")}
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
          render(placeItems(place, startNewPlan, eventCode, eventInfo.direct_to_portal), mydiv);
      })
    });
}
