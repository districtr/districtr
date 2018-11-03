import { districtColors } from "../colors";
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

function getAssignment(layer) {
    const features = layer.query(feature => feature);
    let assignment = {};
    for (let feature of features) {
        let part = layer.getAssignment(feature.id);
        if (part === undefined) {
            part = null;
        }
        assignment[feature.id] = part;
    }
    return assignment;
}

export default class State {
    constructor(layerInfo, units) {
        this.units = units;

        this.parts = getParts(layerInfo);
        this.elections = getElections(layerInfo, units);
        this.population = getPopulation(layerInfo);
        this.assignment = getAssignment(units);

        this.update = this.update.bind(this);
    }
    update(feature, part) {
        this.population.update(feature, part);
        this.elections.forEach(election => election.update(feature, part));
        this.assignment[feature.id] = part;
    }
}
