import { html, render } from "lit-html";
import { initializeMap } from "../Map/map";
import { hydratedPlacesList } from "../components/PlacesList";
export default () => {
    const map = initializeMap(
        "map",
        {
            maxBounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
            bounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
            fitBoundsOptions: { padding: 50 },
            style: "mapbox://styles/mapbox/streets-v9"
        },
        false
    );
    const places = hydratedPlacesList(
        place => place.name.toLowerCase().includes("chicago"),
        placeItemsTemplate
    );

    const target = document.getElementById("districting-options");
    render(places.render(), target);
};

const placeItemsTemplate = (place, onClick) =>
    place.districtingProblems.map(
        problem => html`
            <li
                class="places-list__item"
                @click="${() => onClick(place, problem)}"
            >
                <div class="place-name">
                    ${problem.type === "multimember"
                        ? "Multi-member Wards"
                        : `${problem.numberOfParts} ${problem.pluralNoun}`}
                </div>
                <div class="place-info">
                    ${place.unitType}
                </div>
            </li>
        `
    );
