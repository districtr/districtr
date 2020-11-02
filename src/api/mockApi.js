export function listPlaces(placeID, stateName) {
    if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
        return fetch("/assets/data/response.json").then(resp => resp.json());
    } else if (stateName) {
        return fetch("/.netlify/functions/fetchModule?state=" + stateName).then(resp => resp.json());
    } else {
        return fetch("/.netlify/functions/fetchModule?id=" + placeID).then(resp => resp.json());
    }
}
