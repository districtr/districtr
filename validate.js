// check
const fs = require("fs");
let seenPlanIds = [];

function validateFile() {
    fs.readFile("./assets/data/response.json", (err, data) => {
        if (err) {
            throw err;
        }
        if (data) {
            try {
                data = JSON.parse(data);
            } catch (e) {
                throw new Error("Could not parse JSON data from response.json");
            }
            if (Array.isArray(data) && data.length > 0) {
                data.forEach(validatePlan);
                console.log("Success! response.json is valid");
            } else {
                throw new Error("response.json was not an Array with content");
            }
        } else {
            throw new Error("response.json was blank");
        }
    });
}
function validatePlan(plan, index) {
    if (!plan.id) {
        throw new Error((index + 1) + "-th plan had no id");
    }

    let repeatId = seenPlanIds.indexOf(plan.id);
    if (repeatId > -1) {
        throw new Error((index + 1) + "-th plan has same id ("
            + plan.id + ") as the " + (repeatId + 1) + "-th");
    }
    seenPlanIds.push(plan.id);

    if (!plan.name) {
        throw new Error(plan.id + " has no name");
    }
    if (!plan.state) {
        throw new Error(plan.id + " has no state");
    }
    if (!plan.districtingProblems || !Array.isArray(plan.districtingProblems)) {
        throw new Error(plan.id + " has no array of districting problems");
    }
    plan.districtingProblems.forEach((problem, index) => {
        validateProblem(problem, index, plan.id);
    });

    if (!plan.units || !Array.isArray(plan.units)) {
        throw new Error(plan.id + " has no array of units");
    }
    plan.units.forEach((unit, index) => {
        validateUnits(unit, index, plan.id);
    });
}

function validateProblem(problem, index, id) {
    if (!problem.numberOfParts || typeof problem.numberOfParts !== "number") {
        throw new Error(id + " is missing non-zero numberOfParts on its "
            + (index + 1) + "-th districting problem");
    }
    if (!problem.pluralNoun) {
        throw new Error(id + " is missing pluralNoun on its "
            + (index + 1) + "-th districting problem");
    }
    if (!problem.name) {
      throw new Error(id + " is missing name on its "
          + (index + 1) + "-th districting problem");
    }
}

function validateUnits(unit, index, id) {
    ["id", "name", "unitType"].forEach((check) => {
        if (!unit[check]) {
            throw new Error(id + " is missing " + check + " on its "
                + (index + 1) + "-th unit entry");
        }
    });
    if (!unit.columnSets || !Array.isArray(unit.columnSets)) {
        throw new Error(id + " is missing columnSets array on its "
            + (index + 1) + "-th unit entry");
    }
    unit.columnSets.forEach((columnSet, csi) => {
        validateColumnSet(columnSet, csi, index, id);
    });

    if (!unit.idColumn || !unit.idColumn.name || !unit.idColumn.key) {
        throw new Error(id + " is missing a complete idColumn on its "
            + (index + 1) + "-th unit entry");
    }
    if (!unit.bounds || unit.bounds.length !== 2
        || unit.bounds[0].length !== 2 || unit.bounds[1].length !== 2
    ) {
        throw new Error(id + " is missing a complete bounds array on its "
            + (index + 1) + "-th unit entry");
    }

    if (!unit.tilesets || !Array.isArray(unit.tilesets)
        || unit.tilesets.length !== 2
    ) {
        throw new Error(id + " is missing a 2-length tilesets array on its "
            + (index + 1) + "-th unit entry");
    }

    unit.tilesets.forEach((tileset) => {
        ["source", "sourceLayer"].forEach((check) => {
            if (!tileset[check]) {
                throw new Error(id + " is missing a tileset's " + check + " on its "
                    + (index + 1) + "-th unit entry");
            }
        });
    });

    if (
        (unit.tilesets[0].type === "fill" && unit.tilesets[1].type === "circle")
        || (unit.tilesets[0].type === "circle" && unit.tilesets[1].type === "fill")
    ) {
        unit.tilesets.forEach((tileset) => {
            if (tileset.source.type !== "vector") {
                throw new Error(id + " is missing a vector type on a tileset, in "
                    + (index + 1) + "-th unit entry");
            }
            if (!tileset.source.url) {
                throw new Error(id + " is missing a source url on a tileset, in "
                    + (index + 1) + "-th unit entry");
            }
        });

    } else {
        throw new Error(id + " is missing one of fill + circle tilesets on its "
            + (index + 1) + "-th unit entry");
    }
}

function validateColumnSet(columnSet, columnSetIndex, unitIndex, planId) {
    let checks = ["type"];

    if (columnSet.type === "election") {
        if (columnSet.metadata &&
            (!columnSet.metadata.race || !columnSet.metadata.year))
        {
            throw new Error(planId + " is missing election metadata on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
        }
    } else {
        checks.push("name");
        checks.push("total");
        validateCSentry(columnSet, 'total', columnSetIndex, unitIndex, planId);
    }

    checks.forEach((check) => {
        if (!columnSet[check]) {
            throw new Error(planId + " is missing a columnSet " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
        }
    });

    if (!columnSet.subgroups || !Array.isArray(columnSet.subgroups)) {
        throw new Error(planId + " is missing a subgroups array on its "
            + (unitIndex + 1) + "-th unit entry, "
            + (columnSetIndex + 1) + "-th columnSet");
    }
    columnSet.subgroups.forEach((subgroup, sindex) => {
        validateCSentry(columnSet, sindex, columnSetIndex, unitIndex, planId);
    });
}
function validateCSentry(columnSet, field, columnSetIndex, unitIndex, planId) {
    let columnData = (typeof field === 'number')
        ? columnSet.subgroups[field]
        : columnSet[field];
    ["key", "name"].forEach((check) => {
        if (!columnData[check]) {
            throw new Error(planId + " is missing a " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
        }
    });
    ["sum", "min", "max"].forEach((check) => {
        if (typeof columnData[check] !== "number") {
            throw new Error(planId + " is missing a numeric " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
        }
    });
}

// start at the top
validateFile();
