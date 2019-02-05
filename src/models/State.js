import { districtColors } from "../colors";
import { Landmarks } from "../components/Landmark";
import { addLayers } from "../Map/map";
import Election from "./Election";
import IdColumn from "./IdColumn";
import Part from "./Part";
import Population from "./Population";

function assignLoadedUnits(state, assignment, remainingUnitIds) {
    const featuresByUnitId = state.units
        .queryRenderedFeatures()
        .reduce((lookup, feature) => {
            const featureId = state.idColumn.getValue(feature);
            if (featureId !== undefined && featureId !== null) {
                return {
                    ...lookup,
                    [featureId]: feature
                };
            }
            return lookup;
        }, {});

    for (let unitId of remainingUnitIds) {
        const feature = featuresByUnitId[unitId];
        const hasExpectedData = state.hasExpectedData(feature);
        if (hasExpectedData) {
            state.update(feature, assignment[unitId]);
            state.units.setAssignment(feature, assignment[unitId]);
            remainingUnitIds.delete(unitId);
        }
    }
    return remainingUnitIds;
}

function assignUnitsAsTheyLoad(state, assignment) {
    let remainingUnitIds = new Set(Object.keys(assignment));
    let intervalId = null;
    const stop = () => window.clearInterval(intervalId);
    const callback = () => {
        if (remainingUnitIds.size == 0) {
            stop();
            state.render();
        }
        remainingUnitIds = assignLoadedUnits(
            state,
            assignment,
            remainingUnitIds
        );
    };
    intervalId = window.setInterval(callback, 100);
}

function getParts(problem) {
    let colors = districtColors.slice(0, problem.numberOfParts);

    let name = "District";
    if (problem.name !== undefined) {
        name = problem.name;
    }

    const parts = colors.map(
        color => new Part(color.id, name, color.id + 1, color.hex)
    );
    return parts;
}

function getPopulation(place, parts) {
    return new Population(place.population, parts);
}

function getElections(place, problem, layer) {
    if (place.elections.length === 0) {
        return [];
    }
    return place.elections.map(
        election =>
            new Election(
                `${election.year} ${election.race} Election`,
                election.voteTotals,
                problem.numberOfParts,
                layer
            )
    );
}

/**
 * Holds all of the state that needs to be updated after
 * each brush stroke. (Mainly the Plan assignment and the
 * population tally.)
 */
export default class State {
    constructor(map, { place, problem, id, assignment }) {
        if (id) {
            this.id = id;
        } else {
            this.id = generateId(8);
        }
        this.placeId = place.id;

        this.initializeMapState(map, place);
        this.getInitialState(place, assignment, problem);
        this.subscribers = [];

        this.update = this.update.bind(this);
        this.exportAsJSON = this.exportAsJSON.bind(this);
        this.render = this.render.bind(this);
    }
    initializeMapState(map, place) {
        map.fitBounds(place.bounds, {
            padding: {
                top: 50,
                right: 350,
                left: 50,
                bottom: 50
            }
        });
        const { units, unitsBorders, points } = addLayers(map, place.tilesets);

        this.units = units;
        this.unitsBorders = unitsBorders;
        this.layers = [units, points];
        this.map = map;

        if (place.landmarks) {
            this.landmarks = new Landmarks(map, place.landmarks);
        }
    }
    update(feature, part) {
        this.population.update(feature, part);
        this.elections.forEach(election => election.update(feature, part));
        this.assignment[this.idColumn.getValue(feature)] = part;
    }
    getInitialState(place, assignment, problem) {
        this.place = place;
        this.idColumn =
            place.idColumn !== undefined
                ? new IdColumn(place.idColumn)
                : // This fallback is only here for places without an IdColumn.
                  // This includes Lowell and Alaska, and possibly more places.
                  { getValue: feature => feature.id };

        this.problem = problem;
        this.parts = getParts(problem);
        this.elections = getElections(place, problem, this.units);
        this.population = getPopulation(place, this.parts);

        this.columns = [
            this.population.total,
            ...this.population.subgroups,
            ...this.elections.reduce(
                (cols, election) => [...cols, ...election.columns],
                []
            )
        ];

        this.assignment = {};

        if (assignment) {
            assignUnitsAsTheyLoad(this, assignment);
        }
    }
    exportAsJSON() {
        const serialized = {
            assignment: this.assignment,
            id: this.id,
            placeId: this.placeId,
            problem: this.problem
        };
        const text = JSON.stringify(serialized);
        download(`districtr-plan-${this.id}.json`, text);
    }
    subscribe(f) {
        this.subscribers.push(f);
    }
    render() {
        for (let f of this.subscribers) {
            f();
        }
    }
    supportsEvaluationTab() {
        return (
            this.population.subgroups.length > 0 || this.elections.length > 0
        );
    }
    hasExpectedData(feature) {
        if (feature === undefined || feature.properties === undefined) {
            return false;
        }
        for (let column of this.columns) {
            if (feature.properties[column.key] === undefined) {
                return false;
            }
        }
        return true;
    }
}

function download(filename, text) {
    let element = document.createElement("a");
    element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," + encodeURIComponent(text)
    );
    element.setAttribute("download", filename);

    element.style.display = "none";
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

// Copied from stackoverflow https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript
function dec2hex(dec) {
    return ("0" + dec.toString(16)).substr(-2);
}

function generateId(len) {
    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, dec2hex).join("");
}
