export function listPlaces() {
    return fetch("https://districtr.org/assets/data/response.json").then(resp =>
        resp.json()
    );
}
