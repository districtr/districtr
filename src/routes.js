import { listPlaces } from "./api/mockApi";

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
    let headers = rows[0].split(",");
    if (
        headers[0].indexOf("\"id-") === 0
        && headers[0].split("-").length === 3
    ) {
        // new format, verify units match
        //id-state.place.id-state.units.id
        let placeId = headers[0].split("-")[1],
            unitId = headers[0].split("-")[2];

        if (placeId !== state.place.id) {
            throw new Error("CSV is for a different module (another state or region).");
        } else if (unitId !== state.units.id) {
            throw new Error("CSV is for this module but a different divison (e.g. blocks, precincts).");
        }
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
                    key = cols[0] * 1,
                    val = cols[1] * 1;

                if (key && !isNaN(val)) {
                    planRecord.assignment[key] = val;
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
