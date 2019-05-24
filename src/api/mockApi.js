export function listPlaces() {
    return fetch("/assets/data/response.json").then(resp => resp.json());
    // return client.get("/places/").then(r => r.json());
}
