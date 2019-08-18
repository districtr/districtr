import Election from "../Election";
import Part from "../Part";
import Population from "../Population";
import { districtColors } from "../../colors";

// This module provides functions that creates Part and ColumnSet (Election
// and Population) objects from the Place and DistrictingProblem records
// provided from the backend (specified in the YAML config files used when
// generating tilesets). This is currently a sort of ad hoc process, where
// we identify Population and VAP based on the ColumnSet type and name,
// and Elections by their type ("election"). These are saved as
// `state.population` and `state.vap`, respectively.

// In the future, it would be better to just create the ColumnSets based
// on their type without handling them as special cases (so `state.vap`
// would not exist, just `state.columnSets` or something). We would
// want to configure what charts and overlays we want available for
// each type of ColumnSet somewhere---maybe in the records for the place's
// Districtr module, or just within the codebase.

// The idea is that we should be able to add more ColumnSets (e.g. Under-18
// Population) without having to go through all the places in the code
// where we use `state.vap` and add code handling `state.under18` or
// something.

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
