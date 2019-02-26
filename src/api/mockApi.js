export function listPlaces() {
    return fetch("./assets/data/response.json").then(resp => resp.json());
}
