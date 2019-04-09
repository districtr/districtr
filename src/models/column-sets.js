import Election from "./Election";
import Part from "./Part";
import Population from "./Population";
import { districtColors } from "../colors";

export function getParts(problem) {
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

export function getColumnSets(state, unitsRecord) {
    state.elections = getElections(unitsRecord, state.parts);
    state.population = getPopulation(unitsRecord, state.parts);
    state.vap = getVAP(unitsRecord, state.parts);

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
