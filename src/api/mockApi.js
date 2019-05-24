import { client } from "./client";

export function listPlaces() {
    // return fetch("/assets/data/places.json").then(resp => resp.json());
    return client.get("/places/").then(r => r.json());
}
