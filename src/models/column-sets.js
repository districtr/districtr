import Election from "./Election";
import Part from "./Part";
import Population from "./Population";
import { districtColors } from "../colors";

export function getParts(problem, savedParts) {
    let name = problem.name || "District";
    let number =
        problem.number || problem.numberOfParts || problem.number_of_parts;
    let parts = [];

    for (let i = 0; i < number; i++) {
        let j = i % districtColors.length;
        parts[i] = new Part(i, name, i + 1, districtColors[j]);
    }

    if (parts.length > districtColors.length) {
        parts.slice(1).forEach(p => {
            p.visible = false;
        });
    }
    if (savedParts) {
        for (let i = 0; i < savedParts.length; i++) {
            parts[i].updateDescription(savedParts[i]);
        }
    }
    if (problem.type === "multimember" || problem.type === "community") {
        parts.slice(1).forEach(part => {
            part.visible = false;
        });
    }
    if (problem.type === "community") {
        parts.forEach(part => {
            if (!part.name) {
                part.name = `Community ${part.displayNumber}`;
            }
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
    function getYear(election) {
        return parseInt(election.name.split(" ")[0]);
    }
    const elections = place.columnSets.filter(
        columnSet => columnSet.type === "election"
    );

    for (let election of elections) {
        if (!election.name) {
            election.name = `${election.metadata.year} ${
                election.metadata.race
            } Election`;
        } else if (!election.name.endsWith(" Election")) {
            election.name = election.name.concat(" Election");
        }
    }

    return elections
        .sort((a, b) => getYear(b) - getYear(a))
        .map(
            election => new Election(election.name, election.subgroups, parts)
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
        state.columns = [
            ...state.columns,
            ...state.vap.subgroups,
            state.vap.total
        ];
    }

    let columnSets = [state.population, ...state.elections];
    if (state.vap) {
        columnSets.push(state.vap);
    }
    return columnSets;
}
