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
        feature => feature.properties[layerInfo.populationAttribute],
        layerInfo.aggregated.population
    );
}

function getElections(layerInfo, parts) {
    return layerInfo.elections.map(
        election =>
            new Election(
                election.id,
                election.partiesToColumns,
                layerInfo.numberOfParts
            )
    );
}

export default class State {
    constructor(layerInfo) {
        this.parts = getParts(layerInfo);
        this.elections = getElections(layerInfo);
        this.population = getPopulation(layerInfo);
        this.update = this.update.bind(this);
    }
    update(...args) {
        this.population.update(...args);
        this.elections.forEach(election => election.update(...args));
    }
}
