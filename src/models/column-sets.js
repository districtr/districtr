import Election from "./Election";
import Part from "./Part";
import Population from "./Population";
import { districtColors } from "../colors";

export function getParts(problem) {
    let name = problem.name || "District";
    let parts = [];
    for (let i = 0; i < problem.numberOfParts; i++) {
        let j = i % districtColors.length;
        parts[i] = new Part(i, name, i + 1, districtColors[j]);
    }
    if (parts.length > districtColors.length) {
        parts.slice(1).forEach(p => {
            p.visible = false;
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
    elections.forEach(election => {
        election.year = election.metadata
            ? election.metadata.year
            : election.name.split(" ")[0];
    });
    return elections
        .sort((a, b) => b.year - a.year)
        .map(
            election =>
                new Election(
                    election.metadata
                        ? `${election.metadata.year} ${
                              election.metadata.race
                          } Election`
                        : `${election.name} Election`,
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
