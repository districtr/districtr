import { html } from "lit-html";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import { startNewPlan } from "../routes";

let _placesCache = {};
let _placesList = null;

export function listPlacesForState(state) {
    if (_placesList === null) {
        return listPlaces().then(items => {
            _placesList = items;
            _placesCache[state] = _placesList.filter(
                item => item.state === state || item.name === state
            );
            return _placesCache[state];
        });
    }
    if (_placesCache[state] === undefined) {
        _placesCache[state] = _placesList.filter(
            item => item.state === state || item.name === state
        );
    }
    return Promise.resolve(_placesCache[state]);
}

export function PlacesListForState(
    state,
    fallbackComponent,
    placeItemsTemplate = placeItems
) {
    return new PlacesList(
        listPlacesForState(state),
        startNewPlan,
        placeItemsTemplate,
        fallbackComponent
    );
}

export function placeItems(place, onClick) {
    return place.districtingProblems
        .map(problem =>
            place.units.map(
                units => html`
                    <li
                        class="places-list__item"
                        @click="${() => onClick(place, problem, units)}"
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
                        ${units.unitType
                            ? html`
                                  <div class="place-info">
                                      ${units.unitType}
                                  </div>
                              `
                            : ""}
                    </li>
                `
            )
        )
        .reduce((items, item) => [...items, ...item], []);
}

export default class PlacesList {
    constructor(
        places,
        choosePlace,
        placeItemsTemplate = placeItems,
        fallbackComponent
    ) {
        this.places = places;
        this.choosePlace = choosePlace;
        this.placeItemsTemplate = placeItemsTemplate;
        if (fallbackComponent === null || fallbackComponent === undefined) {
            fallbackComponent = () => "";
        }
        this.fallbackComponent = fallbackComponent;
    }
    render() {
        return html`
            ${until(
                this.places.then(p =>
                    p.length > 0
                        ? html`
                              <ul class="places-list">
                                  ${p
                                      .map(place =>
                                          this.placeItemsTemplate(
                                              place,
                                              this.choosePlace
                                          )
                                      )
                                      .reduce(
                                          (items, item) => [...items, ...item],
                                          []
                                      )}
                              </ul>
                          `
                        : this.fallbackComponent()
                ),
                ""
            )}
        `;
    }
}
