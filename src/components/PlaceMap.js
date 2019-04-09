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
    "Georgia",
    "Pennsylvania",
    "Vermont",
    "Wisconsin",
    "Massachusetts",
    "Missouri",
    "Mississippi",
    "Illinois",
    "Texas",
    "New York",
    "North Carolina",
    "California"
];

// Sentinel for when the mouse is not over a state
const noHover = {};

let stateSelected = false;

// =============
// State updates
// =============

function selectState(path, feature, e) {
    if (stateSelected === false) {
        stateSelected = true;
        if (feature.properties.isAvailable) {
            e.target.classList.add("state--selected");
            zoomToFeature(path, feature);
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

function zoomToFeature(path, feature) {
    const bounds = path.bounds(feature),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.75 / Math.max(dx / 1280, dy / 600),
        translate = [1280 * (1 / 4) - scale * x, 600 / 2 - scale * y];
    select("g")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

// ==========
// Components
// ==========

export function Features(features, onHover) {
    const scale = 1280;
    const translate = [640, 300];
    const path = geoPath(
        geoAlbersUsa()
            .scale(scale)
            .translate(translate)
    );
    return svg`<svg viewBox="0 0 1280 600" style="width:100%; height:auto;">
    <g id="states-group" @mouseleave=${() => onHover(noHover)}>
    ${features.features.map(
        feature =>
            svg`<path class="${
                feature.properties.isAvailable
                    ? "state state--available"
                    : "state"
            }"
            d="${path(feature)}" @mouseover=${() => onHover(feature)} @click=${
                feature.properties.isAvailable
                    ? e => selectState(path, feature, e)
                    : undefined
            }></path>`
    )}
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

function modulesAvailable(feature) {
    const list = PlacesListForState(feature.properties.NAME, () =>
        emptyModuleFallback(feature)
    );
    return html`
        <div class="media">
            <button
                class="button button--transparent button--icon media__close"
                id="back-to-map"
                @click=${resetMap}
            >
                <i class="material-icons">
                    close
                </i>
            </button>
            <h3 class="media__title">${feature.properties.NAME}</h3>
            <div class="media__body">
                ${list.render()}
            </div>
        </div>
    `;
}
export function PlaceMap(features) {
    return html`
        <div class="place-map__form">
            <input
                id="place-search"
                class="place-map__search"
                name="place"
                type="text"
                disabled
            />
        </div>
        <div
            class="place-map__state-modules place-map__state-modules--hidden"
            id="places-list"
        ></div>
        <figure class="place-map">
            ${Features(features, setSearchText)}
        </figure>
    `;
}

export function PlaceMapWithData() {
    return fetchFeatures().then(features => PlaceMap(features));
}

// =============
// Data fetching
// =============

function fetchFeatures(availablePlaces = available) {
    return fetch("./assets/simple_states.json")
        .then(r => r.json())
        .then(states => {
            for (let i = 0; i < states.features.length; i++) {
                let feature = states.features[i];
                feature.properties.isAvailable = availablePlaces.includes(
                    feature.properties.NAME
                );
            }

            return states;
        });
}
