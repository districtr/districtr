export function fetchApi() {
    return fetch("./data/response.json").then(resp => resp.json());
}
