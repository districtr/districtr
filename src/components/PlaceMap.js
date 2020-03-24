/* eslint-disable max-lines */
import { geoPath, geoAlbersUsa } from "d3-geo";
import { svg, html, render } from "lit-html";
import { PlacesListForState } from "../components/PlacesList";
import { select, selectAll } from "d3-selection";
import "d3-transition";

// ============
// Global state
// ============

const available = [
    "Alaska",
    "Arkansas",
    "Georgia",
    "Pennsylvania",
    "Vermont",
    "Wisconsin",
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
    "Washington"
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

const cityFeatures = [
    {type:"Feature",geometry:{type:"Point",coordinates:[-71.3121125,42.6473304]},properties:{name:"Lowell",type:"city",STUSPS:"MA"}},
];

// Sentinel for when the mouse is not over a state
const noHover = {};

let stateSelected = false;

let FEATURES = [];

const scale = 1280;
const translate = [640, 300];
const path = geoPath(
    geoAlbersUsa()
        .scale(scale)
        .translate(translate)
).pointRadius(2);

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
    selectAll("path").attr("stroke-width", 0.5);
    selectAll(".city").style("display", "block");
    if (stateSelected === false && feature.properties.isAvailable) {
        if (window.location.pathname.split("/").length >= 3) {
            // already zoomed in on one state
            selectAll(".places-list__item").style("display", "block");
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
    } else if (feature.properties.type === "city") {
        selectAll(".places-list__item").style("display", "none");
        selectAll(".places-list__item." + feature.properties.name).style("display", "block");
    }
}

function resetMap() {
    stateSelected = false;
    selectAll("path").attr("stroke-width", 2);
    selectAll(".city").style("display", "none");
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
    const bounds = path.bounds(feature),
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
        "city": feature.properties.type === "city"
    };
    return Object.keys(classes)
        .filter(key => classes[key])
        .join(" ");
}

export function Features(features, onHover, selectedId) {
    return svg`<svg viewBox="0 0 1280 600" style="width:100%; height:auto;">
    <g id="states-group" transform="${
        selectedId
            ? transformAndTranslate(
                  features.features.find(
                      feature =>
                          feature.properties.STUSPS.toLowerCase() === selectedId
                          && feature.type !== "city"
                  )
              )
            : ""
    }" @mouseleave=${() => onHover(noHover)}>
    ${features.features.concat(cityFeatures).map(feature => {
        const featureId = (feature.properties.type === "city")
            ? feature.properties.name + "_city"
            : feature.properties.STUSPS.toLowerCase();
        return svg`<path id="${featureId}" class="${featureClasses(
            feature,
            featureId,
            selectedId
        )}"
            style="${feature.properties.isAvailable ? "" : "cursor:default"} ${feature.geometry.type === "Point" ? "display:none" : ""}"
            d="${path(feature)}" @mouseover=${() => onHover(feature)} @click=${
            feature.properties.isAvailable || feature.properties.type === "city"
                ? e => selectState(feature, e.target)
                : undefined
        }></path>`;
    })}
    <path fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d="${path(
        features
    )}"></path>
    </g>
  </svg>`;
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

function modulesAvailable(feature, onClose) {
    if (!onClose) {
        onClose = () => history.back();
    }
    const list = PlacesListForState(feature.properties.NAME, () =>
        emptyModuleFallback(feature)
    );
    return html`
        <div class="media">
            <button
                class="button button--transparent button--icon media__close"
                id="back-to-map"
                @click=${onClose}
            >
                <i class="material-icons">
                    close
                </i>
            </button>
            <h3 class="media__title media__title--primary">
                ${feature.properties.NAME}
            </h3>
            <div class="media__body">
                ${feature.properties.NAME == "Illinois"
                    ? html`
                          <p>
                              <a href="/chicago"
                                  >Read about MGGG's report on alternative
                                  districting systems for Chicago's City Council
                                  here.</a
                              >
                          </p>
                      `
                    : ""}
                ${list.render()}
            </div>
            <a class="learn__more" href="/${feature.properties.NAME.toLowerCase()}">
                More about Redistricting in ${feature.properties.NAME}</a>
        </div>
    `;
}

let defaultHistoryState = location.pathname;
let currentHistoryState = `/${window.location.pathname.split("/")[1]}`;

export function PlaceMap(features, selectedId) {
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
                  return html`<option value="${st}" ?disabled=${!available.includes(st)}>
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
                  })
                : ""}
        </div>
        <figure class="place-map">
            ${Features(features, setSearchText, selectedId)}
        </figure>
    `;
}

export function PlaceMapWithData() {
    const selectedId = location.pathname
        .split("/")
        .slice(-1)[0]
        .toLowerCase();
    return fetchFeatures().then(features =>
        PlaceMap(
            features,
            (selectedId && !["new", "community"].includes(selectedId))
                ? selectedId
                : null
        )
    );
}

// =============
// Data fetching
// =============

function fetchFeatures(availablePlaces = available) {
    return fetch("/assets/simple_states.json")
        .then(r => r.json())
        .then(states => {
            states.features.forEach((feature) => {
                feature.properties.isAvailable = availablePlaces.includes(
                    feature.properties.NAME
                );
            });
            FEATURES = states;
            return states;
        });
}
