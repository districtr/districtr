const BASE_URL =
    location.hostname === "localhost"
        ? "http://localhost:3000"
        : "https://districtr.org";

export function listPlaces() {
    return fetch(`${BASE_URL}/assets/data/response.json`).then(resp =>
        resp.json()
    );
}
