
function setContiguityStatus(contiguities, dnum) {
    try {
        document.querySelector(`#contiguity-${dnum}`).style.display =
            contiguities[dnum] ? "none" : "flex";

        let foundDiscontiguity = false;
        Object.keys(contiguities).forEach((d) => {
            if (!contiguities[d]) {
                foundDiscontiguity = true;
            }
        });
        document.querySelector("#contiguity-status").innerText =
            foundDiscontiguity
                ? "Districts may have contiguity gaps"
                : "Any districts are contiguous"
    } catch(e) { }
}

export default function ContiguityChecker(state, brush) {
    if (!state.contiguity) {
        state.contiguity = {};
    }

    const updater = (state, colorsAffected) => {
        let assignment = state.plan.assignment,
            source = (state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0,
            place = source || state.place.id,
            testIDs = {};

        Object.keys(assignment).forEach((unit_id) => {
            let districtNum = assignment[unit_id];
            if (testIDs[districtNum]) {
                testIDs[districtNum].push(unit_id);
            } else {
                testIDs[districtNum] = [unit_id];
            }
        });

        // let my_tstamp = new Date();
        colorsAffected.forEach((dnum) => {
            if (!dnum && dnum !== 0) {
                // avoid eraser
                return;
            }
            if (!testIDs[dnum] || testIDs[dnum].length <= 1) {
                // 0-1 precincts automatically OK
                state.contiguity[dnum] = true;
                setContiguityStatus(state.contiguity, dnum);
                return;
            }

            fetch("/.netlify/functions/planContiguity", {
                method: "POST",
                mode: "no-cors",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    ids: testIDs[dnum].join(","),
                    state: place
                })
            })
            .then(res => res.json())
            .then((data) => {
                if (data.length) {
                    data = data[0];
                }
                let keys = Object.keys(data),
                    geomType = data[keys[0]];
                state.contiguity[dnum] = (geomType !== "ST_MultiPolygon");
                setContiguityStatus(state.contiguity, dnum);
            })
            .catch((err) => {
                // on localhost, no connection = random result, for UI testing
                if (window.location.hostname === "localhost") {
                    state.contiguity[dnum] = (Math.random() > 0.5);
                    setContiguityStatus(state.contiguity, dnum);
                } else {
                    console.error(err);
                }
            });
        });
    };

    let allDistricts = [],
        i = 0;
    while (i < state.problem.numberOfParts) {
        allDistricts.push(i);
        i++;
    }
    updater(state, allDistricts);
    return updater;
}
