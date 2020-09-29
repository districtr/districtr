/* eslint-disable array-bracket-newline */
import { html } from "lit-html";
import { until } from "lit-html/directives/until";
import { listPlaces } from "../api/mockApi";
import { startNewPlan } from "../routes";

let _placesCache = {};
let _placesList = null;
let justCommunities = false;

export function onlyCommunities() {
    justCommunities = true;
}

function communitiesFilter(place) {
    if (justCommunities) {
        place.districtingProblems = [
            { type: "community", numberOfParts: 250, pluralNoun: "Community" }
        ];
    }
    return place;
}

export function listPlacesForState(state, communityEvent) {
    if (_placesList === null) {
        return listPlaces().then(items => {
            _placesList = items.filter(place => !place.limit || justCommunities || communityEvent)
                .map(communitiesFilter);
            _placesCache[state] = _placesList.filter(
                item => item.state === state || item.name === state || item.id === state
            );
            return _placesCache[state];
        });
    }
    if (_placesCache[state] === undefined) {
        _placesCache[state] = _placesList.filter(
            item => item.state === state || item.name === state || item.id === state
        );
    }
    return Promise.resolve(_placesCache[state]);
}

export function PlacesListForState(
    state,
    selectModule,
    fallbackComponent,
    placeItemsTemplate = placeItems
) {
    return new PlacesList(
        listPlacesForState(state),
        selectModule,
        startNewPlan,
        placeItemsTemplate,
        fallbackComponent
    );
}

export function getUnits(place, problem) {
    if (problem.units) {
        return place.units.filter(units => problem.units.includes(units.id));
    }
    return place.units.filter((unitType) => !unitType.limit
        || (unitType.limit === "community" && (window.location.href.includes("community") || window.location.href.includes("event")))
    ).sort((a, b) => {
        const x = a.name.toLowerCase();
        const y = b.name.toLowerCase();
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    });
}

const problemTypeInfo = {
    multimember: html`
        <div class="place-info">
            Multi-member districts of varying sizes
        </div>
    `,
    community: html`
        <div class="place-info">Identify a community</div>
    `
};

function getProblemInfo(place, problem, units, onClick) {
    return html`
        ${problemTypeInfo[problem.type] || ""}
        ${problem.type !== "community"
            ? html`
                  ${problem.partCounts.length > 1
                      ? html`<div class="place-info">
                            ${problem.pluralNoun}:
                            ${problem.partCounts.map(num =>
                                html`<button
                                    @click=${() => onClick(place, problem, units, null, num)}
                                >
                                    ${num}
                                </button>`
                            )}
                        </div>`
                      : html`<div class="place-info">
                          ${problem.numberOfParts} ${problem.pluralNoun}
                        </div>`
                  }
              `
            : ""}
    `;
}

export function placeItems(place, onClick, eventCode) {
    let districtingProblems = [],
        seenIds = new Set();
    place.districtingProblems.forEach((problem) => {
        let problemID = problem.name + problem.pluralNoun;
        if (seenIds.has(problemID)) {
            districtingProblems[districtingProblems.length - 1].partCounts.push(
                problem.numberOfParts
            );
        } else {
            seenIds.add(problemID);
            problem.partCounts = [problem.numberOfParts];
            districtingProblems.push(problem);
        }
    });
    return districtingProblems
        .map(problem =>
            getUnits(place, problem).sort((a, b) => a.unitType < b.unitType ? 1 : -1).map(
                units => html`
                    <li
                        class="places-list__item ${problem.partCounts.length > 1 ? "choice" : ""}"
                        @click="${(problem.partCounts.length > 1) || (() => onClick(place, problem, units, null, null, eventCode))}"
                    >
                        <div class="place-name">${place.name}</div>
                        ${getProblemInfo(place, problem, units, onClick)}
                        ${units.unitType
                            ? html`
                                  <div class="place-info">
                                      Built out of ${units.name.toLowerCase()}
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
        selectModule,
        choosePlace,
        placeItemsTemplate = placeItems,
        fallbackComponent
    ) {
        this.places = places;
        this.selectModule = selectModule;
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
                                      .filter(place => (!this.selectModule || this.selectModule === place.id))
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
