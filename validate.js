// check
const fs = require("fs"),
      fetch = require("node-fetch");
const mbPublicKey = "pk.eyJ1IjoiZGlzdHJpY3RyIiwiYSI6ImNqbjUzMTE5ZTBmcXgzcG81ZHBwMnFsOXYifQ.8HRRLKHEJA0AismGk2SX2g";
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
                console.error("Could not parse JSON data from response.json");
                process.exit(1);
            }
            if (Array.isArray(data) && data.length > 0) {
                async function checkPlan(p) {
                    if (p >= data.length) {
                        return console.log("Success! response.json is valid");
                    }
                    await validatePlan(data[p]);
                    checkPlan(p + 1);
                }
                checkPlan(0);

            } else {
                console.error("response.json was not an Array with content");
                process.exit(1);
            }
        } else {
            console.error("response.json was blank");
            process.exit(1);
        }
    });
}
async function validatePlan(plan, index) {
    if (!plan.id) {
        console.error((index + 1) + "-th plan had no id");
        process.exit(1);
    }

    let repeatId = seenPlanIds.indexOf(plan.id);
    if (repeatId > -1) {
        console.error((index + 1) + "-th plan has same id ("
            + plan.id + ") as the " + (repeatId + 1) + "-th");
        process.exit(1);
    }
    seenPlanIds.push(plan.id);

    if (!plan.name) {
        console.error(plan.id + " has no name");
        process.exit(1);
    }
    if (!plan.state) {
        console.error(plan.id + " has no state");
        process.exit(1);
    }
    if (!plan.districtingProblems || !Array.isArray(plan.districtingProblems)) {
        console.error(plan.id + " has no array of districting problems");
        process.exit(1);
    }
    plan.districtingProblems.forEach((problem, index) => {
        validateProblem(problem, index, plan.id);
    });

    if (!plan.units || !Array.isArray(plan.units)) {
        console.error(plan.id + " has no array of units");
        process.exit(1);
    }

    async function checkUnit(index) {
        if (index >= plan.units.length) {
            return;
        }
        let unit = plan.units[index];
        await validateUnits(unit, index, plan);
        await checkUnit(index + 1);
    }
    await checkUnit(0);
}

function validateProblem(problem, index, id) {
    if (!problem.numberOfParts || typeof problem.numberOfParts !== "number") {
        console.error(id + " is missing non-zero numberOfParts on its "
            + (index + 1) + "-th districting problem");
        process.exit(1);
    }
    if (!problem.pluralNoun) {
        console.error(id + " is missing pluralNoun on its "
            + (index + 1) + "-th districting problem");
        process.exit(1);
    }
    if (!problem.name) {
        console.error(id + " is missing name on its "
            + (index + 1) + "-th districting problem");
        process.exit(1);
    }
}

async function validateUnits(unit, index, plan) {
    ["id", "name", "unitType"].forEach((check) => {
        if (!unit[check]) {
            console.error(plan.id + " is missing " + check + " on its "
                + (index + 1) + "-th unit entry");
            process.exit(1);
        }
    });
    if (!fs.existsSync("assets/about/" + plan.id + "/" + unit.id + ".html")) {
        console.error(plan.id + " has no about section for its units (" + unit.id + ")");
        if (!["minnesota", "providence_ri", "adams_wa", "yakima_wa", "little_rock", "kingcountywa"].includes(plan.id)) {
            process.exit(1);
        }
    }
    if (!unit.columnSets || !Array.isArray(unit.columnSets)) {
        console.error(plan.id + " is missing columnSets array on its "
            + (index + 1) + "-th unit entry");
        process.exit(1);
    }
    unit.columnSets.forEach((columnSet, csi) => {
        validateColumnSet(columnSet, csi, index, plan.id);
    });

    if (!unit.idColumn || !unit.idColumn.name || !unit.idColumn.key) {
        console.error(plan.id + " is missing a complete idColumn on its "
            + (index + 1) + "-th unit entry");
        process.exit(1);
    }
    if (unit.nameColumn) {
        if (!unit.nameColumn.name || !unit.nameColumn.key) {
            console.error(plan.id + " has a broken nameColumn on its "
                + (index + 1) + "-th unit entry");
            process.exit(1);
        }
    }
    if (!unit.bounds || unit.bounds.length !== 2
        || unit.bounds[0].length !== 2 || unit.bounds[1].length !== 2
    ) {
        console.error(plan.id + " is missing a complete bounds array on its "
            + (index + 1) + "-th unit entry");
        process.exit(1);
    }

    if (!unit.tilesets || !Array.isArray(unit.tilesets)
        // || unit.tilesets.length !== 2
    ) {
        console.error(plan.id + " is missing a 2-length tilesets array on its "
            + (index + 1) + "-th unit entry");
        process.exit(1);
    }

    if (
        (unit.tilesets[0].type === "fill" && unit.tilesets[1].type === "circle")
        || (unit.tilesets[0].type === "circle" && unit.tilesets[1].type === "fill")
    ) {
        unit.tilesets.forEach((tileset) => {
            if (tileset.source.type !== "vector") {
                console.error(plan.id + " is missing a vector type on a tileset, in "
                    + (index + 1) + "-th unit entry");
                process.exit(1);
            }
            if (!tileset.source.url) {
                console.error(plan.id + " is missing a source url on a tileset, in "
                    + (index + 1) + "-th unit entry");
                process.exit(1);
            }
        });

    } else {
        console.error(plan.id + " is missing one of fill + circle tilesets on its "
            + (index + 1) + "-th unit entry");
        process.exit(1);
    }

    async function checkTileset(p) {
        if (p >= unit.tilesets.length) {
            return;
        }
        let tileset = unit.tilesets[p];
        ["source", "sourceLayer"].forEach((check) => {
            if (!tileset[check]) {
                console.error(plan.id + " is missing a tileset's " + check + " on its "
                    + (index + 1) + "-th unit entry");
                process.exit(1);
            }
        });

        let tset = tileset.source.url.split("mapbox://")[1] + ".json";

        let res;
        try {
            res = await fetch(`https://api.mapbox.com/v4/${tset}?secure&access_token=${mbPublicKey}`);
        } catch(e) {
            console.error("No internet to validate MapBox");
            process.exit(1);
        }
        let content = await res.json();
        if (content.message) {
            console.error("Error from MapBox Layer " + tset + ":\n" + content.message);
            process.exit(1);
        } else {
            console.log(tset + " modified " + new Date(content.modified));
            // bounds are frequently different
            if (content.filesize < 1000) {
                console.error("MapBox layer " + tset + " was surprisingly small file");
                process.exit(1);
            }
            // if (content.private) {
            //    console.error("MapBox layer " + tset + " was private");
            //    process.exit(1);
            //}
            let fields = Object.keys(content.vector_layers[0].fields);

            // check ID and name column present
            if (!fields.includes(unit.idColumn.key) && !["maricopa", "phoenix", "nwaz", "seaz", "yuma"].includes(plan.id)) {
                console.error("MapBox layer " + tset + " is missing ID column (" + unit.idColumn.key + ")");
                process.exit(1);
            }
            fields.splice(fields.indexOf(unit.idColumn.key), 1);
            if (unit.nameColumn) {
                fields.splice(fields.indexOf(unit.nameColumn.key), 1);
            }

            unit.columnSets.forEach(cs => {
                if (cs.total) {
                    if (!fields.includes(cs.total.key) && !["maricopa", "phoenix", "nwaz", "seaz", "yuma"].includes(plan.id)) {
                        console.error("MapBox layer " + tset + " missing total field from response.json (" + cs.total.key + ")");
                        process.exit(1);
                    }
                    fields.splice(fields.indexOf(cs.total.key), 1);
                }

                if (!["minnesota", "maricopa", "phoenix", "nwaz", "seaz", "yuma"].includes(plan.id)) {
                    cs.subgroups.forEach(subgroup => {
                        if (!fields.includes(subgroup.key)) {
                            console.error("MapBox layer " + tset + " missing field from response.json (" + subgroup.key + ")");
                            process.exit(1);
                        }
                        if (content.vector_layers[0].fields[subgroup.key] !== "Number") {
                            console.error("MapBox layer " + tset + " has non-numeric data on " + subgroup.key);
                            process.exit(1);
                        }
                        fields.splice(fields.indexOf(subgroup.key), 1);
                    });
                }
            });

            // any response.json columns missing on MapBox side?
            if (fields.length) {
                console.log("response.json not reading fields from MapBox layer " + tset + ": "
                    + JSON.stringify(fields));
            }
        }
        await checkTileset(p + 1);
    }
    await checkTileset(0);
}

function validateColumnSet(columnSet, columnSetIndex, unitIndex, planId) {
    let checks = ["type"];

    if (columnSet.type === "election") {
        if (columnSet.metadata &&
            (!columnSet.metadata.race || !columnSet.metadata.year))
        {
            console.error(planId + " is missing election metadata on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
            process.exit(1);
        }
    } else {
        checks.push("name");
        if (columnSet.type !== "text") {
            // checks.push("total");
            validateCSentry(columnSet, 'total', columnSetIndex, unitIndex, planId);
        }
    }

    checks.forEach((check) => {
        if (!columnSet[check]) {
            console.error(planId + " is missing a columnSet " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
            process.exit(1);
        }
    });

    if (!columnSet.subgroups || !Array.isArray(columnSet.subgroups)) {
        console.error(planId + " is missing a subgroups array on its "
            + (unitIndex + 1) + "-th unit entry, "
            + (columnSetIndex + 1) + "-th columnSet");
        process.exit(1);
    }
    columnSet.subgroups.forEach((subgroup, sindex) => {
        validateCSentry(columnSet, sindex, columnSetIndex, unitIndex, planId);
    });
}
function validateCSentry(columnSet, field, columnSetIndex, unitIndex, planId) {
    let columnData = (typeof field === 'number')
        ? columnSet.subgroups[field]
        : columnSet[field];
    if (!columnData) {
        // text field
        return;
    }
    ["key", "name"].forEach((check) => {
        if (!columnData[check]) {
            console.error(planId + " is missing a " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
            process.exit(1);
        }
    });
    ["sum", "min", "max"].forEach((check) => {
        if (typeof columnData[check] !== "number") {
            console.error(planId + " is missing a numeric " + check + " on its "
                + (unitIndex + 1) + "-th unit entry, "
                + (columnSetIndex + 1) + "-th columnSet");
            process.exit(1);
        }
    });
}

validateFile();
