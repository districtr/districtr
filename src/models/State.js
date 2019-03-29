import { districtColors } from "../colors";
import { Landmarks } from "../components/Landmark";
import { addLayers } from "../Map/map";
import Election from "./Election";
import IdColumn from "./IdColumn";
import { assignUnitsAsTheyLoad } from "./lib";
import Part from "./Part";
import Population from "./Population";
import { generateId } from "../utils";

function getParts(problem) {
    let colors = districtColors.slice(0, problem.numberOfParts);

    let name = "District";
    if (problem.name !== undefined) {
        name = problem.name;
    }

    const parts = colors.map(
        color => new Part(color.id, name, color.id + 1, color.hex)
    );

    if (problem.type === "multimember") {
        parts.slice(1).forEach(part => {
            part.visible = false;
        });
    }

    return parts;
}

function getPopulation(place, parts) {
    const population = place.columnSets.find(
        columnSet => columnSet.name === "Population"
    );
    return new Population({ ...population, parts });
}

function getVAP(place, parts) {
    const vap = place.columnSets.find(
        columnSet => columnSet.name === "Voting Age Population"
    );
    if (vap) {
        return new Population({ ...vap, parts });
    } else {
        return null;
    }
}

function getElections(place, parts) {
    const elections = place.columnSets.filter(
        columnSet => columnSet.type === "election"
    );
    return elections.map(
        election =>
            new Election(
                `${election.metadata.year} ${election.metadata.race} Election`,
                election.subgroups,
                parts
            )
    );
}

function getColumnSets(state, place) {
    state.elections = getElections(place, state.parts);
    state.population = getPopulation(place, state.parts);
    state.vap = getVAP(place, state.parts);

    state.columns = [
        state.population.total,
        ...state.population.subgroups,
        ...state.elections.reduce(
            (cols, election) => [...cols, ...election.subgroups],
            []
        )
    ];
    if (state.vap) {
        state.columns += [...state.vap.subgroups, state.vap.total];
    }

    let columnSets = [...state.elections, state.population];
    if (state.vap) {
        columnSets.push(state.vap);
    }
    return columnSets;
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
        this.columnSets.forEach(columnSet => columnSet.update(feature, part));
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
        this.columnSets = getColumnSets(this, place);
        this.assignment = {};

        if (assignment) {
            assignUnitsAsTheyLoad(this, assignment);
        }
    }
    exportAsJSON() {
        const serialized = {
            assignment: this.assignment,
            id: this.id,
            idColumn: { key: this.idColumn.key, name: this.idColumn.name },
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
            this.population.subgroups.length > 1 || this.elections.length > 0
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
