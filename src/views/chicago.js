import { html, render } from "lit-html";
import { initializeMap } from "../Map/map";
import { listPlacesForState } from "../components/PlacesList";
import { startNewPlan } from "../routes";

export default () => {
    initializeMap(
        "map",
        {
            maxBounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
            bounds: [[-87.9401, 41.6445], [-87.3241, 42.023]],
            fitBoundsOptions: { padding: 50 },
            style: "mapbox://styles/mapbox/streets-v9"
        },
        false
    );
    const places = listPlacesForState("Illinois").then(places =>
        placeItemsTemplate(places[0], startNewPlan)
    );
    const target = document.getElementById("districting-options");
    render(places.render(), target);
};

const placeItemsTemplate = (place, onClick) =>
    place.districtingProblems
        .map(problem =>
            place.units.map(
                units => html`
                    <li
                        class="places-list__item"
                        @click="${() => onClick(place, problem, units)}"
                    >
                        <div class="place-name">
                            ${problem.type === "multimember"
                                ? "Multi-member Wards"
                                : `${problem.numberOfParts} ${
                                      problem.pluralNoun
                                  }`}
                        </div>
                        <div class="place-info">
                            ${units.unitType}
                        </div>
                    </li>
                `
            )
        )
        .reduce((items, item) => [...items, ...item], []);
