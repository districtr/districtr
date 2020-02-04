
export default function ContiguityChecker(state, brush) {
    const host = (window.location.hostname === "localhost") ? "https://deploy-preview-157--districtr-web.netlify.com" : "";
    window.d_contiguity = {};

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
                window.d_contiguity[dnum] = true;
                try {
                    document.querySelector(`.color-list li[title='${dnum + 1}'] div`).className = "icon-list__item__radio";
                } catch(e) {
                }
                return;
            }

            fetch(host + "/.netlify/functions/planContiguity", {
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
                window.d_contiguity[dnum] = (geomType !== "ST_MultiPolygon");
                try {
                    document.querySelector(".color-list li[title='" + (dnum + 1) + "'] div").className =
                        "icon-list__item__radio " + (window.d_contiguity[dnum] ? "" : "contiguity");
                } catch(e) {
                }
                // console.log(dnum + ": " + geomType);
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
