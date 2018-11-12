import { districtColors } from "../colors";
import { addLayers } from "../Map/map";
import { fetchApi } from "../mockApi";
import { zeros } from "../utils";
import Election from "./Election";
import Part from "./Part";
import Population from "./Population";

function getParts(layerInfo) {
    let colors = districtColors.slice(0, layerInfo.numberOfParts);
    const parts = colors.map(
        color => new Part(color.id, "District", color.hex)
    );
    return parts;
}

function getPopulation(layerInfo) {
    return new Population(
        zeros(layerInfo.numberOfParts),
        layerInfo.properties.population.key,
        layerInfo.properties.population.total
    );
}

function getElections(layerInfo, layer) {
    return layerInfo.elections.map(
        election =>
            new Election(
                election.id,
                `${election.year} ${election.race} Election`,
                election.partiesToColumns,
                layerInfo.numberOfParts,
                layer
            )
    );
}

export default class State {
    constructor(map, layerInfo, id, assignment) {
        if (id) {
            this.id = id;
        } else {
            this.id = randomishString(8);
        }

        this.placeId = layerInfo.id;

        this.initializeMapState(map, layerInfo);
        this.getInitialState(layerInfo, assignment);

        this.update = this.update.bind(this);
        this.exportAsJSON = this.exportAsJSON.bind(this);
    }
    initializeMapState(map, layerInfo) {
        const { units, unitsBorders } = addLayers(map, layerInfo);

        this.units = units;
        this.unitsBorders = unitsBorders;
        this.map = map;
    }
    update(feature, part) {
        this.population.update(feature, part);
        this.elections.forEach(election => election.update(feature, part));
        this.assignment[feature.id] = part;
    }
    getInitialState(layerInfo, assignment) {
        this.parts = getParts(layerInfo);
        this.elections = getElections(layerInfo, this.units);
        this.population = getPopulation(layerInfo);
        if (assignment) {
            this.assignment = assignment;
            for (let unitId in assignment) {
                this.units.setAssignment(unitId, assignment[unitId]);
            }
        } else {
            this.assignment = {};
        }
    }
    exportAsJSON() {
        const serialized = {
            assignment: this.assignment,
            id: this.id,
            placeId: this.placeId
        };
        const text = JSON.stringify(serialized);
        download(`districtr-plan-${this.id}.json`, text);
    }
    static importFromJSON(map, serialized) {
        fetchApi()
            .then(places => places.find(p => p.id === serialized.placeId))
            .then(place => {
                if (place === undefined) {
                    throw Error(`This place ${place} does not exist`);
                } else {
                    return new State(map, place, serialized.assignment);
                }
            });
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

function randomishString(length) {
    const alphabet = "aAbBcCdDeEfFgGhHiIjJkKlLmMnNoOpPqQrRsStTuUvVwWxXyYzZ0123456789".split(
        ""
    );
    let string = "";
    for (let i = 0; i < length; i++) {
        string += randomChoice(alphabet);
    }
    return string;
}

function randomChoice(sequence) {
    const index = Math.floor(Math.random() * sequence.length);
    return sequence[index];
}
