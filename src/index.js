import { html, render } from "lit-html";
import { initializeMap } from "./Map/map";
import apiResponse from "./mockApi";
import State from "./models/State";
import PlacesList from "./PlacesList";
import toolbarView from "./tools";

// const API = "https://districtr.mggg.org/api";

export function main() {
    renderInitialView(new Promise(resolve => resolve(apiResponse)));
}
function renderEditView(layerInfo) {
    render(
        html`
            <div id="map"></div>
            <div id="toolbar"></div>
        `,
        document.getElementById("root")
    );
    const map = initializeMap("map");
    map.on("load", () => {
        let state = new State(map, layerInfo);
        state.units.whenLoaded(() => {
            // We can and should use lit-html to start rendering before the layers
            // are all loaded
            toolbarView(state);
        });
    });
}

export function renderInitialView(places) {
    const listOfPlaces = new PlacesList(places, renderEditView);
    render(listOfPlaces.render(), document.getElementById("root"));
}

main();
