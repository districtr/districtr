import { listPlaces } from "./api/mockApi";
import { client } from "./api/client";

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
    // Convert snake case to camel case
    state.units = {
        ...units,
        nameColumn: units.name_column,
        idColumn: units.id_column,
        columnSets: units.column_sets,
        unitType: units.unit_type
    };
    state.problem = { ...state.problem, number: problem.number_of_parts };
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
        const place = places.find(
            p => p.id === planRecord.placeId || p.id === planRecord.place
        );
        const units =
            place.units.find(u => u.id === planRecord.units) ||
            planRecord.units;
        return {
            ...planRecord,
            place,
            units
        };
    });
}

export function loadPlanFromBackend(planId) {
    return client
        .get(`/plans/${planId}`)
        .then(r => r.json())
        .then(context => {
            // This is probably where we should do any
            // camelCase translation.
            let units = context.units;
            let newUnits = {
                id: units.id,
                slug: units.slug,
                idColumn: units.id_column,
                nameColumn: units.name_column,
                columnSets: units.column_sets,
                unitType: units.unit_type,
                bounds: units.bounds,
                tilesets: units.tilesets
            };
            return { ...context, units: newUnits };
        });
    // .then(loadPlanFromJSON);
}

export function loadPlanFromURL(url) {
    return fetch(url)
        .then(r => r.json())
        .then(loadPlanFromJSON);
}
