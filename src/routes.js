const routes = {
    "/": "./index.html",
    "/new": "./new.html",
    "/edit": "./edit.html",
    "/register": "./register.html",
    "/request": "./request.html",
    "/signin": "./signin.html"
};

export function navigateTo(route) {
    if (routes.hasOwnProperty(route)) {
        location.assign(routes[route]);
    }
}
