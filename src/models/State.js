import Election from "./Election";
import Population from "./Population";

function getParts(layerInfo) {
    let colors = districtColors.slice(0, layerInfo.numberOfDistricts);
    const parts = colors.map(
        color => new Part(color.id, "District", color.hex)
    );
    return parts;
}

function getPopulation(layerInfo) {
    return new Population(
        this.parts.map(() => 0),
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
    }
    update(...args) {
        this.population.update(...args);
        this.elections.forEach(election => election.update(...args));
    }
}
