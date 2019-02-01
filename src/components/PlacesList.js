import { html } from "lit-html";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import { navigateTo } from "../routes";

export function hydratedPlacesList() {
    const places = listPlaces();
    return new PlacesList(places, (place, problem) => {
        localStorage.setItem("place", JSON.stringify(place));
        localStorage.setItem("districtingProblem", JSON.stringify(problem));
        // localStorage.removeItem("assignment");
        navigateTo("/edit");
    });
}

export default class PlacesList {
    constructor(places, choosePlace) {
        this.places = places;
        this.choosePlace = choosePlace;
    }
    render() {
        return html`
            <section class="toolbar-section places-list-container">
                <ul class="places-list">
                    ${until(
                        this.places.then(p =>
                            p
                                .map(place =>
                                    placeItems(place, this.choosePlace)
                                )
                                .reduce(
                                    (items, item) => [...items, ...item],
                                    []
                                )
                        ),
                        ""
                    )}
                </ul>
            </section>
        `;
    }
}

export function placeItems(place, onClick) {
    return place.districtingProblems.map(
        problem => html`
            <li
                class="places-list__item"
                @click="${() => onClick(place, problem)}"
            >
                <div class="place-name">${place.name}</div>
                <div class="place-info">
                    ${problem.numberOfParts} ${problem.plural}
                </div>
            </li>
        `
    );
}
