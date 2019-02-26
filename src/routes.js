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
