import { listPlaces } from "./api/mockApi";

const routes = {
    "/": "./",
    "/new": "./new",
    "/edit": "./edit",
    "/register": "./register",
    "/request": "./request",
    "/signin": "./signin",
    "/signout": "./signout"
};

export function navigateTo(route) {
    if (routes.hasOwnProperty(route)) {
        location.assign(routes[route]);
    } else {
        throw Error("The requested route does not exist: " + route);
    }
}

export function startNewPlan(place, problem, units, planId) {
    localStorage.setItem("place", JSON.stringify(place));
    localStorage.setItem("units", JSON.stringify(units));
    localStorage.setItem("districtingProblem", JSON.stringify(problem));
    localStorage.removeItem("assignment");
    localStorage.removeItem("planId");
    if (planId !== null && planId !== undefined) {
        localStorage.setItem("planId", planId);
    }
    navigateTo("/edit");
}

export function savePlanToStorage({
    place,
    problem,
    units,
    planId,
    assignment
}) {
    localStorage.setItem("place", JSON.stringify(place));
    localStorage.setItem("units", JSON.stringify(units));
    localStorage.setItem("districtingProblem", JSON.stringify(problem));
    localStorage.setItem("assignment", JSON.stringify(assignment));
    localStorage.setItem("planId", planId);
}

export function getContextFromStorage() {
    const placeJson = localStorage.getItem("place");
    const problemJson = localStorage.getItem("districtingProblem");
    const unitsJson = localStorage.getItem("units");

    if (placeJson === null || problemJson === null) {
        navigateTo("/new");
    }

    const place = JSON.parse(placeJson);
    const problem = JSON.parse(problemJson);
    const units = JSON.parse(unitsJson);

    const planId = localStorage.getItem("planId");
    const assignmentJson = localStorage.getItem("assignment");
    const assignment = assignmentJson ? JSON.parse(assignmentJson) : null;

    return { place, problem, id: planId, assignment, units };
}

export function loadPlanFromJSON(planRecord) {
    return listPlaces().then(places => {
        const place = places.find(
            p =>
                p.id === planRecord.placeId ||
                p.permalink === planRecord.placeId
        );
        return {
            place,
            problem: planRecord.problem,
            planId: planRecord.id,
            units: planRecord.units,
            assignment: planRecord.assignment
        };
    });
}

export function loadPlanFromURL(url) {
    return fetch(url)
        .then(r => r.json())
        .then(loadPlanFromJSON);
}
