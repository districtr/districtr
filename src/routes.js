import { listPlaces } from "./api/mockApi";

const routes = {
    "/": "/",
    "/new": "/new",
    "/edit": "/edit",
    "/event": "/event",
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

export function startNewPlan(place, problem, units, id) {
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

export function savePlanToDB(state, eventCode, callback) {
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
            plan: serialized,
            token: token.split("_")[0],
            eventCode: eventCode,
            hostname: window.location.hostname,
            screenshot: tokenValid || document.getElementsByClassName("mapboxgl-canvas")[0].toDataURL("image/jpeg")
        };
    fetch(saveURL, {
        method: "POST",
        body: JSON.stringify(requestBody)
    })
    .then(res => res.json())
    .then(info => {
        if (info.simple_id) {
            history.pushState({}, "Districtr", `/edit/${info.simple_id}`);
            callback(info.simple_id);
            if (info.token) {
                localStorage.setItem("districtr_token_" + info.simple_id, info.token + "_" + (1 * new Date()));
            }
        } else {
            callback(null);
        }
    })
    .catch(e => callback(null));
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
    return listPlaces().then(places => {
        const place = places.find(p => p.id === planRecord.placeId);
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
            unitId = unitId.split("_")[1];
        }

        if (placeId !== state.place.id) {
            throw new Error("CSV is for a different module (another state or region).");
        } else if (unitId !== state.units.id) {
            throw new Error("CSV is for this module but a different unit map (e.g. blocks, precincts).");
        } else if (pluralType !== state.problem.pluralNoun.replace(/\s+/g, "")) {
            throw new Error("CSV is for this module but a different division map (e.g. districts)");
        }
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
