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
            { type: "community", numberOfParts: 50, pluralNoun: "Community" }
        ];
    }
    return place;
}

export function listPlacesForState(state, show_just_communities = false) {
    if (_placesList === null) {
        return listPlaces().then(items => {
            _placesList = items.filter(place => !place.limit || show_just_communities)
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

export function getUnits(place, problem, show_just_communities = false) {
    // console.log(problem, place);
    if (problem.units) {
        return place.units.filter(units => problem.units.includes(units.id));
    }
    return place.units.filter((unitType) => !unitType.limit || (unitType.limit === "community" && show_just_communities))
        .sort((a, b) => {
          
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
                            ${problem.pluralNoun}: </div>
                            <div class="place-info">
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

export function placeItems(place, onClick) {
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
    return [html`<h3 class="place-name ${place.name.replace(/\s+/g, '')}">
                 ${place.name === place.state ? "Statewide" : place.name}</h3>
                 <ul class="places-list places-list--columns ${place.name.replace(/\s+/g, '')}">
                 ${districtingProblems
        .map(problem =>
            getUnits(place, problem).sort((a, b) => a.unitType < b.unitType ? 1 : -1).map(
                units => html`
                    <li
                        class="places-list__item ${problem.partCounts.length > 1 ? "choice" : ""}"
                        @click="${(problem.partCounts.length > 1) || (() => onClick(place, problem, units))}"
                    >
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
        .reduce((items, item) => [...items, ...item], [])}
                 </ul>`];
}
//From line 132: <div class="place-name">${place.name}</div>

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
                        ? //html`
                            //  <ul class="places-list">
                                  // ${
                                    p
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
                                      )//}
                             // </ul>
                         // `
                        : this.fallbackComponent()
                ),
                ""
            )}
        `;
    }
}
