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
    let population = place.columnSets.find(
        columnSet => columnSet.name === "Population"
    );
    let population18 = place.columnSets.find(
        columnSet => columnSet.name === "Population (2018)"
    );
    let population19 = place.columnSets.find(
        columnSet => columnSet.name === "Population (2019)"
    );
    if (population18) {
        population18.subgroups.forEach(sg => {
            sg.name += " (2018)";
            sg.total_alt = true;
            population.subgroups.push(sg);
        });
        population18.total.total_alt = true;
        population.subgroups.push(population18.total);
        population.total_alt = population18.total;
        population.name_alt = "Population (2018)";
    }
    if (population19) {
        population19.subgroups.forEach(sg => {
            sg.name += " (2019)";
            sg.total_alt = true;
            population.subgroups.push(sg);
        });
        population19.total.total_alt = true;
        population.subgroups.push(population19.total);
        population.total_alt = population19.total;
        population.name_alt = "Population (2019)";
    }
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

function getCVAP(place, parts) {
    const cvap = place.columnSets.find(
        columnSet => columnSet.name === "Citizen Voting Age Population"
    );
    if (cvap) {
        return new Population({ ...cvap, parts });
    } else {
        return null;
    }
}

function getPcts(place, parts) {
    const pcts = place.columnSets.find(
        columnSet => columnSet.name && columnSet.name.toLowerCase() === "percentages"
    );
    if (pcts) {
        return new Population({ ...pcts, parts });
    } else {
        return null;
    }
}

function getAges(place, parts) {
    const ages = place.columnSets.find(
        columnSet => columnSet.name === "Age of Population"
    );
    if (ages) {
        return new Population({ ...ages, parts });
    } else {
        return null;
    }
}

function getIncomes(place, parts) {
    const incomes = place.columnSets.find(
        columnSet => columnSet.name === "Households by Income"
    );
    if (incomes) {
        return new Population({ ...incomes, parts });
    } else {
        return null;
    }
}

function getMedIncome(place, parts) {
    const incomes = place.columnSets.find(
        columnSet => columnSet.name === "Median Income"
    );
    if (incomes) {
        return new Population({ ...incomes, parts });
    } else {
        return null;
    }
}

function getRent(place, parts) {
    const rent = place.columnSets.find(
        columnSet => columnSet.name === "Households by Rental"
    );
    if (rent) {
        return new Population({ ...rent, parts });
    } else {
        return null;
    }
}

function getBroadband(place, parts) {
    const broadband = place.columnSets.find(
        columnSet => columnSet.name === "Technology"
    );
    if (broadband) {
        return new Population({ ...broadband, parts });
    } else {
        return null;
    }
}

function getSNAP(place, parts) {
    const snap = place.columnSets.find(
        columnSet => columnSet.name === "Households and Food"
    );
    if (snap) {
        return new Population({ ...snap, parts });
    } else {
        return null;
    }
}

function getAsthma(place, parts) {
    const asthma = place.columnSets.find(
        columnSet => columnSet.name === "Health issues"
    );
    if (asthma) {
        return new Population({ ...asthma, parts });
    } else {
        return null;
    }
}

function getEducation(place, parts) {
    const edu = place.columnSets.find(
        columnSet => columnSet.name === "Education"
    );
    if (edu) {
        return new Population({ ...edu, parts });
    } else {
        return null;
    }
}

function getVoters(place, parts) {
    const voters = place.columnSets.find(
        columnSet => columnSet.name === "Registered Voters"
    );
    if (voters) {
        return new Population({ ...voters, parts });
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
    const alternate = place.columnSets.filter(
        columnSet => columnSet.type === "electionx"
    );

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
                    parts,
                    alternate
                        ? alternate.find(e => e.name === election.name)
                        : null
                )
        );
}

export function getColumnSets(state, unitsRecord) {
    state.elections = getElections(unitsRecord, state.parts);
    state.population = getPopulation(unitsRecord, state.parts);
    state.vap = getVAP(unitsRecord, state.parts);
    state.cvap = getCVAP(unitsRecord, state.parts);
    state.pcts = getPcts(unitsRecord, state.parts);
    state.ages = getAges(unitsRecord, state.parts);
    state.incomes = getIncomes(unitsRecord, state.parts);
    state.median_income = getMedIncome(unitsRecord, state.parts);
    state.rent = getRent(unitsRecord, state.parts);
    state.broadband = getBroadband(unitsRecord, state.parts);
    state.snap = getSNAP(unitsRecord, state.parts);
    state.asthma = getAsthma(unitsRecord, state.parts);
    state.education = getEducation(unitsRecord, state.parts);
    state.voters = getVoters(unitsRecord, state.parts);

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
    if (state.cvap) {
        state.columns = [
            ...state.columns,
            ...state.cvap.subgroups,
            state.cvap.total
        ];
    }
    if (state.pcts) {
        state.columns = [
            ...state.columns,
            ...state.pcts.subgroups,
        ];
    }
    if (state.ages) {
        state.columns = [
            ...state.columns,
            ...state.ages.subgroups
            // no total
        ];
    }
    if (state.incomes) {
        state.columns = [
            ...state.columns,
            ...state.incomes.subgroups
            // no total
        ];
    }
    if (state.median_income) {
        state.columns = [
            ...state.columns,
            ...state.median_income.subgroups
            // no total
        ];
    }
    if (state.rent) {
        state.columns = [
            ...state.columns,
            ...state.rent.subgroups
            // no total
        ];
    }
    if (state.broadband) {
        state.columns = [
            ...state.columns,
            ...state.broadband.subgroups
            // no total
        ];
    }
    if (state.snap) {
        state.columns = [
            ...state.columns,
            ...state.snap.subgroups
            // no total
        ];
    }
    if (state.asthma) {
        state.columns = [
            ...state.columns,
            ...state.asthma.subgroups,
            state.asthma.total
        ];
    }
    if (state.education) {
        state.columns = [
            ...state.columns,
            ...state.education.subgroups.sort((a, b) => (a.key < b.key ? -1 : 1)),
            // state.population.total
        ];
    }
    if (state.voters) {
        state.columns = [
            ...state.columns,
            ...state.voters.subgroups,
            state.voters.total
        ];
    }

    let columnSets = [state.population, ...state.elections];
    if (state.vap) {
        columnSets.push(state.vap);
    }
    if (state.cvap) {
        columnSets.push(state.cvap);
    }
    if (state.pcts) {
        columnSets.push(state.pcts);
    }
    if (state.ages) {
        columnSets.push(state.ages);
    }
    if (state.incomes) {
        columnSets.push(state.incomes);
    }
    if (state.median_income) {
        columnSets.push(state.median_income);
    }
    if (state.rent) {
        columnSets.push(state.rent);
    }
    if (state.broadband) {
        columnSets.push(state.broadband);
    }
    if (state.snap) {
        columnSets.push(state.snap);
    }
    if (state.asthma) {
        columnSets.push(state.asthma);
    }
    if (state.education) {
        columnSets.push(state.education);
    }
    if (state.voters) {
        columnSets.push(state.voters);
    }
    return columnSets;
}
