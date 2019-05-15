export function listPlaces() {
    // return fetch("/assets/data/response.json").then(resp => resp.json());
    return fetch("http://localhost:5000/places/").then(r => r.json());
}
