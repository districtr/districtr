export function listPlaces() {
    return fetch("./data/response.json").then(resp => resp.json());
}
