import { geoPath, geoAlbersUsa } from "d3-geo";
import { svg, html } from "lit-html";
import { select, selectAll } from "d3-selection";
import "d3-transition";

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
    "California"
];

// Sentinel for when the mouse is not over a state
const noHover = {};

function zoomToFeature(path, feature) {
    const bounds = path.bounds(feature),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = 0.5 / Math.max(dx / 1280, dy / 600),
        translate = [1280 / 2 - scale * x, 600 / 2 - scale * y];
    select("g")
        .transition()
        .duration(500)
        .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function selectState(path, feature, e) {
    e.stopPropagation();
    e.target.classList.add("state--selected");
    if (feature.properties.isAvailable) {
        zoomToFeature(path, feature);
        selectAll("path").classed("state--zoomed", true);
        select("#back-to-map").classed("hidden", false);
        select("#place-search").classed("hidden", true);
    }
}

function resetMap() {
    select("g")
        .transition()
        .duration(500)
        .attr("transform", "");
    selectAll("path")
        .classed("state--zoomed", false)
        .classed("state--selected", false);
    select("#back-to-map").classed("hidden", true);
    select("#place-search").classed("hidden", false);
}

export function Features(features, onHover) {
    const scale = 1280,
        translate = [640, 300],
        path = geoPath(
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
            d="${path(feature)}" @mouseover=${() =>
                onHover(feature)} @click=${e =>
                selectState(path, feature, e)}></path>`
    )}
    <path fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d="${path(
        features
    )}"></path>
    </g>
  </svg>`;
}

function setSearchText(feature) {
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

export function PlaceMap(features) {
    return html`
        <figure class="place-map">
            <input
                type="text"
                id="place-search"
                name="place-search"
                class="place-map__search"
            />
            <button
                class="button button--alternate hidden place-map__back"
                id="back-to-map"
                @click=${resetMap}
            >
                Back
            </button>
            ${Features(features, setSearchText)}
        </figure>
    `;
}

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

export function PlaceMapWithData() {
    return fetchFeatures().then(features => PlaceMap(features));
}
