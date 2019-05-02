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

export function loadPlanFromURL(url) {
    return fetch(url)
        .then(r => r.json())
        .then(loadPlanFromJSON);
}
