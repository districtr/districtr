import { listPlaces } from "./api/mockApi";
import { spatial_abilities } from "./utils";

const routes = {
    "/": "/",
    "/new": "/new",
    "/edit": "/edit",
    "/register": "/register",
    "/request": "/request",
    "/signin": "/signin",
    "/signout": "/signout"
};

export function navigateTo(route) {
    if (routes.hasOwnProperty(route)) {
        location.assign(routes[route]);
    } else {
        throw Error("The requested route does not exist: " + route);
    }
}

export function startNewPlan(place, problem, units, id, setParts) {
    if (setParts) {
        problem.numberOfParts = setParts;
    }
    savePlanToStorage({ place, problem, units, id });
    navigateTo("/edit");
}

export function savePlanToStorage({
    place,
    problem,
    units,
    id,
    assignment,
    name,
    description,
    parts
}) {
    const state = {
        place,
        problem,
        units,
        id,
        assignment,
        name,
        description,
        parts
    };
    localStorage.setItem("savedState", JSON.stringify(state));
}

export function savePlanToDB(state, eventCode, planName, callback) {
    const serialized = state.serialize(),
        mapID = window.location.pathname.split("/").slice(-1)[0],
        token = localStorage.getItem("districtr_token_" + mapID) || "",
        createdAfter = (new Date() * 1) - 24 * 60 * 60 * 1000,
        tokenValid = (token && (token !== "null")
            && (token.split("_")[1] * 1 > createdAfter)),
        saveURL = tokenValid
            ? ("/.netlify/functions/planUpdate?id=" + mapID)
            : "/.netlify/functions/planCreate",
        requestBody = {
            plan: JSON.parse(JSON.stringify(serialized)),
            token: token.split("_")[0],
            eventCode: eventCode,
            planName: planName,
            hostname: window.location.hostname
        };
    // VA fix - if precinct IDs are strings, escape any "."
    Object.keys(requestBody.plan.assignment || {}).forEach(key => {
        if (typeof key === "string" && key.indexOf(".") > -1) {
            requestBody.plan.assignment[key.replace(/\./g, "÷")] =
                requestBody.plan.assignment[key];
            delete requestBody.plan.assignment[key];
        }
    });
    let saveme = (requestBody) => {
        fetch(saveURL, {
            method: "POST",
            body: JSON.stringify(requestBody)
        })
        .then(res => res.json())
        .then(info => {
            if (info.simple_id) {
                history.pushState({}, "Districtr", `/edit/${info.simple_id}`);
                if (info.token && localStorage) {
                    localStorage.setItem("districtr_token_" + info.simple_id, info.token + "_" + (1 * new Date()));
                }
                callback(info.simple_id);
            } else {
                callback(null);
            }
        })
        .catch(e => callback(null));
    };
    if (spatial_abilities(state.place.id).screenshot) {
        fetch("//mggg.pythonanywhere.com/picture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serialized),
        })
        .then((res) => res.text())
        .catch((e) => {
            console.error(e);
            saveme(requestBody);
        })
        .then((data) => {
            requestBody.screenshot = 'data:image/png;base64,' + data.substring(2, data.length - 1);
            saveme(requestBody);
        });
    } else {
        saveme(requestBody);
    }
}

export function getContextFromStorage() {
    const savedState = localStorage.getItem("savedState");
    let state;
    try {
        state = JSON.parse(savedState);
    } catch (e) {
        localStorage.removeItem("savedState");
        navigateTo("/new");
    }

    if (state === null || state === undefined) {
        navigateTo("/new");
    }

    return state;
}

export function loadPlanFromJSON(planRecord) {
    if (planRecord.msg && planRecord.plan) {
        // retrieved from database
        console.log(planRecord.msg);
        planRecord = planRecord.plan;
    }
    Object.keys(planRecord.assignment || {}).forEach((key) => {
        if (String(key).includes('÷')) {
            let newKey = key.replace(/÷/g, ".");
            planRecord.assignment[newKey] = planRecord.assignment[key];
            delete planRecord.assignment[key];
        }
    });
    return listPlaces().then(places => {
        const place = places.find(p => String(p.id).replace(/÷/g, ".") === String(planRecord.placeId));
        place.landmarks = (planRecord.place || {}).landmarks;
        return {
            ...planRecord,
            place
        };
    });
}

export function loadPlanFromCSV(assignmentList, state) {
    let rows = assignmentList.split("\n");
    let headers = rows[0].replace(/"/g, "").trim().split(",");
    if (
        headers[0].indexOf("id-") === 0
        && headers[0].split("-").length === 5
    ) {
        // new format, verify units match
        //id-state.place.id-state.units.id
        let cols = headers[0].split("-");
        let placeId = cols[1],
            unitId = cols[2],
            partCount = cols[3],
            pluralType = cols[4];
        if (unitId.includes("_")) {
            unitId = unitId.split("_").slice(-1)[0];
        }

        if (placeId !== state.place.id) {
            throw new Error("CSV is for a different module (another state or region).");
        } else if (unitId !== state.units.id.split("_").slice(-1)[0]) {
            throw new Error("CSV is for this module but a different unit map (e.g. blocks, precincts).");
        }
        // else if (pluralType !== state.problem.pluralNoun.replace(/\s+/g, "")) {
        //     throw new Error("CSV is for this module but a different division map (e.g. districts)");
        // }
        state.problem.numberOfParts = partCount * 1;
    } else {
        // old format, no column headers
        headers = null;
    }
    let planRecord = state;
    planRecord.assignment = {};
    return listPlaces().then(places => {
        rows.forEach((row, index) => {
            if (index > 0 || !headers) {
                let cols = row.split(","),
                    val = cols[1] * 1,
                    key = (isNaN(cols[0] * 1) || cols[0][0] === "0")
                        ? cols[0]
                        : cols[0] * 1;

                if (key && !isNaN(val)) {
                    planRecord.assignment[key] = val;

                    // if we didn't set numberOfParts in CSV, find max here
                    state.problem.numberOfParts = Math.max(
                        state.problem.numberOfParts,
                        val
                    );
                }
            }
        });

        const place = places.find(p => p.id === planRecord.place.id);
        return {
            ...planRecord,
            place
        };
    });
}

export function loadPlanFromURL(url) {
    return fetch(url)
        .then(r => r.json())
        .then(loadPlanFromJSON);
}
