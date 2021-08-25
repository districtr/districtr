/* eslint-disable max-lines */
import { geoPath } from "d3-geo";
import { geoAlbersUsaTerritories } from "geo-albers-usa-territories";
import { svg, html, render } from "lit-html";
import { PlacesListForState } from "./PlacesList";
import { select, selectAll } from "d3-selection";
import "d3-transition";

// ============
// Global state
// ============

const coi_available = [
];

const available = [
  "Alabama",
  "Florida",
  "Idaho",
  "Indiana",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Missouri",
  "Montana",
  "Nebraska",
  "New Hampshire",
  "New Jersey",
  "North Dakota",
  "Puerto Rico",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "West Virginia",
  "Wyoming",
    "Alaska",
    "Arizona",
    "Arkansas",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Pennsylvania",
    "Vermont",
    "Wisconsin",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Iowa",
    "Mississippi",
    "Illinois",
    "Texas",
    "Nevada",
    "New Mexico",
    "New York",
    "North Carolina",
    "California",
    "Utah",
    "Virginia",
    "Rhode Island",
    "Oregon",
    "Colorado",
    "Ohio",
    "Oklahoma",
    "Hawaii",
    "Washington",
    "Alabama",
    "Idaho",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Missouri",
    "Montana",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "North Dakota",
    "Puerto Rico",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Washington, DC",
    "West Virginia",
    "Wyoming"
];

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

const localFeatures = [

    // {type:"Feature", geometry: {type:"Point", coordinates:[-77.0369,38.9072]},
    //                  properties: {name: "DC", type: "local", STUSPS: "DC"}},
    // {type:"Feature", geometry: {type:"Point", coordinates:[-92.2896,34.7465]},
    //                  properties: {name: "Little Rock", type: "local", STUSPS: "AR"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-122.2869,38.2975]},
    //                  properties: {name: "Napa", type: "local", STUSPS: "CA"}},
    // {type:"Feature", geometry: {type:"Point", coordinates:[-121.9552,37.3541]},
    //                  properties: {name: "Santa Clara", type: "local", STUSPS: "CA"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-87.623177,41.881832]},
    //                  properties: {name: "Chicago", type: "local", STUSPS: "IL"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-71.3121125,42.6473304]},
    //                  properties: {name: "Lowell", type: "local", STUSPS: "MA"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-115.0940,36.0796]},
    //                  properties: {name: "Clark County", type: "local", STUSPS: "NV"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-73.2104,40.7298]},
    //                  properties: {name: "Islip", type: "local", STUSPS: "NY"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-122.6750, 45.5051]},
    //                  properties: {name: "Portland", type: "local", STUSPS: "OR"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-75.1652,39.9526]},
    //                  properties: {name: "Philadelphia", type: "local", STUSPS: "PA"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-71.4128,41.8240]},
    //                  properties: {name: "Providence", type: "local", STUSPS: "RI"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-97.7431,30.2672]},
    //                  properties: {name: "Austin", type: "local", STUSPS: "TX"}},

    // {type:"Feature", geometry: {type:"Point", coordinates:[-120.7558, 46.5436]},
    //                  properties: {name: "Yakima County", type: "local", STUSPS: "WA"}},
    // {type:"Feature", geometry: {type:"Point", coordinates:[-121.9836, 47.5480]},
    //                  properties: {name: "King County", type: "local", STUSPS: "WA"}},
];

const dcpoint = {type:"Feature", geometry: {type:"Point", coordinates:[-77.0369,38.9072]},
                     properties: {name: "Washington, DC", type: "state", STUSPS: "DC"}};

// Sentinel for when the mouse is not over a state
const noHover = {};

let stateSelected = false;

let FEATURES = [];

const scale = 1280;
const translate = [640, 300];
const path = geoPath(
    geoAlbersUsaTerritories()
        .scale(scale)
        .translate(translate)
).pointRadius(2);

const altpath = {
  "DC": geoPath(
    geoAlbersUsaTerritories()
        .scale(scale * 6)
        .translate([-950, 530])
    ),
  "PR": geoPath(
    geoAlbersUsaTerritories()
        .scale(scale * 1.5)
        .translate([430, 120])
    ),
};


export function getFeatureBySTUPS(code) {
    code = code.toLowerCase();
    return FEATURES.filter(
        feature =>
            feature.properties.STUSPS.toLowerCase() === code &&
            feature.properties.isAvailable
    );
}

// =============
// State updates
// =============

export function selectState(feature, target) {
    // selectAll("path").attr("stroke-width", 0.5);
    selectAll(".local").style("display", "block");
    if (stateSelected === false && feature.properties.isAvailable) {
        if (window.location.pathname.split("/").length >= 3) {
            // already zoomed in on one state
            selectAll(".places-list").style("display", "flex");
            selectAll(".place-name").style("display", "block");
            return;
        }
        currentHistoryState = `${window.location.pathname.split("/")[1] || "/new"}/${feature.properties.STUSPS.toLowerCase()}`;
        history.pushState({}, feature.properties.NAME, currentHistoryState);
        target.classList.add("state--selected");
        zoomToFeature(feature);
        selectAll(".state").classed("state--zoomed", true);
        select("#place-search").classed("hidden", true);
        select("#places-list").classed(
            "place-map__state-modules--hidden",
            false
        );
        render(
            modulesAvailable(feature),
            document.getElementById("places-list")
        );
    } else if (feature.properties.type === "local") {
        selectAll(".places-list").style("display", "none");
        selectAll(".places-list." + feature.properties.name.replace(/\s+/g, '')).style("display", "flex");
        selectAll(".place-name").style("display", "none");
        selectAll(".place-name." + feature.properties.name.replace(/\s+/g, '')).style("display", "block");
    }
}

function resetMap() {
    stateSelected = false;
    selectAll("path").attr("stroke-width", 2);
    selectAll(".local").style("display", "none");
    select("g")
        .transition()
        .duration(500)
        .attr("transform", "");
    selectAll(".state")
        .classed("state--zoomed", false)
        .classed("state--selected", false);
    select("#place-search").classed("hidden", false);
    select("#places-list").classed("place-map__state-modules--hidden", true);
    render("", document.getElementById("places-list"));
}

function setSearchText(feature) {
    if (stateSelected === true) {
        return;
    }
    const searchBox = document.getElementById("place-search");
    if (feature === noHover) {
        searchBox.classList.remove("place-map__search--unavailable");
        searchBox.classList.remove("place-map__search--available");
        searchBox.value = "";
        return;
    }
    searchBox.value = feature.properties.NAME;
    if (feature.properties.isAvailable) {
        searchBox.classList.remove("place-map__search--unavailable");
        searchBox.classList.add("place-map__search--available");
    } else {
        searchBox.classList.remove("place-map__search--available");
        searchBox.classList.add("place-map__search--unavailable");
    }
}

// ===========
// Transitions
// ===========

function transformAndTranslate(feature) {
    const bounds = (altpath[feature.properties.STUSPS] || path).bounds(feature),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.75 / Math.max(dx / 1280, dy / 600),
        translate = [1280 * (1 / 4) - scale * x, 600 / 2 - scale * y];
    return `translate(${translate}) scale(${scale})`;
}

function zoomToFeature(feature) {
    select("g")
        .transition()
        .duration(500)
        .attr("transform", transformAndTranslate(feature));
}

// ==========
// Components
// ==========

function featureClasses(feature, featureId, selectedId) {
    const classes = {
        state: true,
        "state--available": feature.properties.isAvailable,
        "state--zoomed": selectedId,
        "state--selected": selectedId === featureId,
        "local": feature.properties.type === "local"
    };
    return Object.keys(classes)
        .filter(key => classes[key])
        .join(" ");
}

export function Features(features, onHover, selectedId, callback) {
    return svg`<svg viewBox="0 0 1280 600" style="width:100%; height:auto;">
    <g id="states-group" transform="${
        selectedId
            ? transformAndTranslate(
                  features.features.find(
                      feature =>
                          feature.properties.STUSPS.toLowerCase() === selectedId
                          && feature.type !== "local"
                  )
              )
            : ""
    }" @mouseleave=${() => onHover(noHover)}>
    ${features.features.concat(localFeatures).map(feature => {
        // console.log(feature);
        const featureId = (feature.properties.type === "local")
            ? feature.properties.name + "_local"
            : feature.properties.STUSPS.toLowerCase();

        return svg`
            ${feature.properties.STUSPS === "DC" ? svg`<path id="${dcpoint.properties.STUSPS.toLowerCase()}"
                                                        class="dc-annotation"
                                                        d="${path(dcpoint).split(",")[0] + "," + path(dcpoint).split(",")[1].slice(0,-2) + "," + altpath["DC"](dcpoint).split(",")[0].substr(1) + "," + altpath["DC"](dcpoint).split(",")[1].slice(0,-2)}"
                                                        @mouseover=${() => onHover(dcpoint)}
                                                        @click="${callback ? () => callback(dcpoint) : ""}"
                                                        onclick=${callback ? "" : selectLandingPage(dcpoint)}></path>`
                                                : svg``}
            <path id="${featureId}" class="${featureClasses(
            feature,
            featureId,
            selectedId
        )}" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"
            style="${feature.properties.isAvailable ? "" : "cursor:default"} ${feature.geometry.type === "Point" ? "display:none" : ""}"
            d="${(altpath[feature.properties.STUSPS] || path)(feature)}" @mouseover=${() => onHover(feature)}
            @click="${callback ? () => callback(feature) : ""}"
            onclick=${callback ? "" : selectLandingPage(feature)}></path>`;
    })}
    </g>
  </svg>`;
}

function selectLandingPage(feature, target) {
  if (feature.properties.isAvailable) {
    let page = feature.properties.NAME.replace(/,/g, "").replace(/\s+/g, '-').toLowerCase();
    if (feature.properties.type === "local") {
      page = feature.properties.name.replace(/,/g, "").replace(/\s+/g, '-').toLowerCase();
    }
    return "window.location.href='/" + page + "'";
  }
  else {
    return "";
  }
}

function emptyModuleFallback(feature) {
    return html`
        <p>
            This state is not available yet.
            <a class="button" href="/request?place=${feature.properties.NAME}"
                >Request&nbsp;it&nbsp;here.
            </a>
        </p>
    `;
}

window.onpopstate = () => {
    currentHistoryState = `/${window.location.pathname.split("/")[1]}`;
    history.replaceState({}, "Districtr", currentHistoryState);
    resetMap();
};

// function modulesAvailable(feature, onClose, placeId) {
//     if (!onClose) {
//         onClose = () => history.back();
//     }
//     const list = PlacesListForState(feature.properties.NAME, placeId, () =>
//         emptyModuleFallback(feature)
//     );
//     return html`
//         <div class="media">
//             <button
//                 class="button button--transparent button--icon media__close"
//                 id="back-to-map"
//                 @click=${onClose}
//             >
//                 <i class="material-icons">
//                     close
//                 </i>
//             </button>
//             <h3 class="media__title media__title--primary">
//                 ${feature.properties.NAME}
//             </h3>
//             <div class="media__body">
//                 ${(feature.properties.NAME == "North Carolina" && window.location.pathname.includes("community"))
//                     ? html`<ul class="places-list">
//                       <a href="https://deploy-preview-189--districtr-web.netlify.app/edit/4463">
//                         <li class="places-list__item ">
//                           <div class="place-name">
//                             North Carolina
//                           </div>
//                           <div class="place-info">Identify a community</div>
//                           <div class="place-info">
//                               Built out of block groups
//                           </div>
//                         </li>
//                       </a>
//                     </ul>`
//                     : ""}
//                 ${feature.properties.NAME == "Illinois"
//                     ? html`
//                           <p>
//                               <a href="/chicago"
//                                   >Read about MGGG's report on alternative
//                                   districting systems for Chicago's City Council
//                                   here.</a
//                               >
//                           </p>
//                       `
//                     : ""}
//                 ${window.location.pathname.includes("community/nc") ? "" : list.render()}
//             </div>
//             <a class="learn__more" href="/${feature.properties.NAME.replace(/\s+/g, '_').toLowerCase()}">
//                 More about Redistricting in ${feature.properties.NAME}</a>
//         </div>
//     `;
// }

let defaultHistoryState = location.pathname;
let currentHistoryState = `/${window.location.pathname.split("/")[1]}`;

export function PlaceMap(features, selectedId, callback) {
    document.addEventListener("keyup", (e) => {
        let selectedState = window.location.pathname.split("/").slice(-1)[0];
        if (selectedState.length === 2 && e.keyCode === 27) {
            history.back();
        }
    });

    const selectedFeature = selectedId
        ? features.features.find(
              feature => feature.properties.STUSPS.toLowerCase() === selectedId
          )
        : null;
    if (!selectedFeature) {
        selectedId = null;
    }
    return html`
        <div class="place-map__form">
            <select
                id="place-search"
                class="place-map__search${selectedId ? " hidden" : ""}"
                name="place"
                @change=${(e) => {
                    let stateName = e.target.value;
                    let postalCode = uspost[stateName];
                    document.getElementById(postalCode).dispatchEvent(new MouseEvent("click"));
                }}
            >
              ${Object.keys(uspost).map(st => {
                  return html`<option value="${st}" ?disabled=${!(available.includes(st) ||
                      (window.location.href.includes("community") && coi_available.includes(st)))}>
                      ${st}
                  </option>`;
              })}
            </select>
        </div>
        <div
            class="place-map__state-modules${selectedId
                ? ""
                : " place-map__state-modules--hidden"}"
            id="places-list"
        >
            ${selectedId
                ? modulesAvailable(selectedFeature, () => {
                      currentHistoryState = `/${window.location.pathname.split("/")[1]}`;
                      history.replaceState({}, "Districtr", currentHistoryState);
                      resetMap();
                  }, location.pathname.split("/")[3])
                : ""}
        </div>
        <figure class="place-map">
            ${Features(features, setSearchText, selectedId, callback)}
        </figure>
    `;
}

export function PlaceMapWithData(callback=null, state_list=null) {
    // empty string or state postal code
    const selectedId = (location.pathname.split("/")[2] || "").toLowerCase();
    state_list = (state_list || available);
    return fetchFeatures(state_list).then(features =>
        PlaceMap(
            features,
            (selectedId && !["new", "community"].includes(selectedId))
                ? selectedId
                : null,
            callback
        )
    );
}

// =============
// Data fetching
// =============

function fetchFeatures(availablePlaces = available) {
    return fetch("/assets/simple_states.json?v=2")
        .then(r => r.json())
        .then(states => {
            states.features.forEach((feature) => {
                feature.properties.isAvailable = availablePlaces.includes(
                    feature.properties.NAME
                ) || (
                    window.location.href.includes("community") && coi_available.includes(
                        feature.properties.NAME
                    )
                );
            });
            FEATURES = states;
            return states;
        });
}
