function getBaseURL() {
    if (window.location.hostname === "localhost") {
        return "http://localhost:3000";
    } else if (window.location.hostname.includes("mggg.org")) {
        return "https://mggg.org/Districtr";
    } else if (window.location.hostname.includes("districtr.org")) {
        return "https://staging.districtr.org";
    }
}

export function listPlaces() {
    return fetch(getBaseURL() + "/assets/data/response.json").then(resp =>
        resp.json()
    );
}
