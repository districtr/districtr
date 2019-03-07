import { html } from "lit-html";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import { navigateTo } from "../routes";

export function hydratedPlacesList(filter, placeItemsTemplate) {
    if (!filter) {
        filter = () => true;
    }
    if (!placeItemsTemplate) {
        placeItemsTemplate = placeItems;
    }
    const places = listPlaces().then(items =>
        items.filter(item => filter(item))
    );
    return new PlacesList(
        places,
        (place, problem) => {
            localStorage.setItem("place", JSON.stringify(place));
            localStorage.setItem("districtingProblem", JSON.stringify(problem));
            localStorage.removeItem("assignment");
            localStorage.removeItem("planId");
            navigateTo("/edit");
        },
        placeItemsTemplate
    );
}

export default class PlacesList {
    constructor(places, choosePlace, placeItemsTemplate) {
        this.places = places;
        this.choosePlace = choosePlace;
        this.placeItemsTemplate = placeItemsTemplate;
    }
    render() {
        return html`
            <ul class="places-list">
                ${until(
                    this.places.then(p =>
                        p
                            .map(place =>
                                this.placeItemsTemplate(place, this.choosePlace)
                            )
                            .reduce((items, item) => [...items, ...item], [])
                    ),
                    ""
                )}
            </ul>
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
                ${problem.type === "multimember"
                    ? html`
                          <div class="place-info">
                              Multi-member Districts
                          </div>
                      `
                    : ""}
                <div class="place-info">
                    ${problem.numberOfParts} ${problem.pluralNoun}
                </div>
                ${place.unitType
                    ? html`
                          <div class="place-info">
                              ${place.unitType}
                          </div>
                      `
                    : ""}
            </li>
        `
    );
}
