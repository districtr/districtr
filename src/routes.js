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

export function loadPlan({ place, problem, units, planId, assignment }) {
    localStorage.setItem("place", JSON.stringify(place));
    localStorage.setItem("units", JSON.stringify(units));
    localStorage.setItem("districtingProblem", JSON.stringify(problem));
    localStorage.setItem("assignment", JSON.stringify(assignment));
    localStorage.setItem("planId", planId);
    navigateTo("/edit");
}
