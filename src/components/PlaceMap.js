import { geoPath, geoAlbersUsa } from "d3-geo";
import { svg, html } from "lit-html";

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

export function PlaceMap(features, onHover) {
    const path = geoPath(
        geoAlbersUsa()
            .scale(1280)
            .translate([480, 300])
    );
    return html`
        <figure class="place-map">
            ${svg`<svg viewBox="0 0 960 600" style="width:100%; height:auto;">
        ${features.features.map(
            feature =>
                svg`<path class=${
                    feature.properties.isAvailable === true
                        ? "state state--available"
                        : "state"
                } d="${path(feature)}" @mouseover=${() =>
                    onHover(feature)}></path>`
        )}
        <path fill="none" stroke="#fff" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" d="${path(
            features
        )}"></path>
      </svg>`}
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
    return fetchFeatures().then(features => PlaceMap(features, () => null));
}
