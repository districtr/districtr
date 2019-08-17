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
    "Massachusetts",
    "Michigan",
    "Iowa",
    "Missouri",
    "Mississippi",
    "Illinois",
    "Texas",
    "New York",
    "North Carolina",
    "California",
    "Utah",
    "Virginia",
    "Rhode Island"
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
);

export function getFeatureBySTUPS(code) {
    code = code.toLowerCase();
    return FEATURES.find(
        feature =>
            feature.properties.STUSPS.toLowerCase() === code &&
            feature.properties.isAvailable
    );
}

// =============
// State updates
// =============

export function selectState(feature, target) {
    if (stateSelected === false && feature.properties.isAvailable) {
        currentHistoryState = `/new/${feature.properties.STUSPS.toLowerCase()}`;
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
    }
}

function resetMap() {
    stateSelected = false;
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
        "state--selected": selectedId === featureId
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
                  )
              )
            : ""
    }" @mouseleave=${() => onHover(noHover)}>
    ${features.features.map(feature => {
        const featureId = feature.properties.STUSPS.toLowerCase();
        return svg`<path id="${featureId}" class="${featureClasses(
            feature,
            featureId,
            selectedId
        )}"
            d="${path(feature)}" @mouseover=${() => onHover(feature)} @click=${
            feature.properties.isAvailable
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
    currentHistoryState = "/new";
    history.replaceState({}, "Districtr", "/new");
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
        </div>
    `;
}

let defaultHistoryState = location.pathname;
let currentHistoryState = "/new";

export function PlaceMap(features, selectedId) {
    document.addEventListener("scroll", () => {
        let el = document.getElementById("place-search");
        let { top, bottom } = el.getBoundingClientRect();
        let isVisible = top < window.innerHeight && bottom >= 0;
        if (isVisible) {
            if (location.pathname !== currentHistoryState) {
                history.replaceState({}, "Districtr", currentHistoryState);
            }
        } else {
            history.replaceState({}, "Districtr", defaultHistoryState);
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
            <input
                id="place-search"
                class="place-map__search${selectedId ? " hidden" : ""}"
                name="place"
                type="text"
                disabled
            />
        </div>
        <div
            class="place-map__state-modules${selectedId
                ? ""
                : " place-map__state-modules--hidden"}"
            id="places-list"
        >
            ${selectedId
                ? modulesAvailable(selectedFeature, () => {
                      currentHistoryState = "/new";
                      history.replaceState({}, "Districtr", "/new");
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
            selectedId && selectedId !== "new" ? selectedId : null
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
            for (let i = 0; i < states.features.length; i++) {
                let feature = states.features[i];
                feature.properties.isAvailable = availablePlaces.includes(
                    feature.properties.NAME
                );
            }
            FEATURES = states;

            return states;
        });
}
