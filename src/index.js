import { html, render } from "lit-html";
import PlacesList from "./components/PlacesList";
import { initializeMap } from "./Map/map";
import { fetchApi } from "./mockApi";
import State from "./models/State";
import toolbarView from "./tools";

// const API = "https://districtr.mggg.org/api";

export function main() {
    renderInitialView();
}
function renderEditView(createState) {
    const root = document.getElementById("root");
    root.setAttribute("class", null);
    render(
        html`
            <div id="map"></div>
            <div id="toolbar"></div>
        `,
        root
    );
    const map = initializeMap("map");
    map.on("load", () => {
        let state = createState(map);
        state.units.whenLoaded(() => {
            // We can and should use lit-html to start rendering before the layers
            // are all loaded
            toolbarView(state);
        });
    });
}

export function renderInitialView() {
    const listOfPlaces = placesList();
    render(
        html`
            ${listOfPlaces.render()}
        `,
        document.getElementById("places-list")
    );
}

function placesList() {
    const places = fetchApi();
    return new PlacesList(places, (place, problem) => {
        renderEditView(map => new State(map, place, problem));
    });
}

export function renderNewPlanView() {
    const listOfPlaces = placesList();
    const uploadPlan = new PlanUploader(json => {
        const serialized = JSON.parse(json);
        fetchApi().then(places => {
            const place = places.find(p => p.id === serialized.placeId);
            renderEditView(
                map =>
                    new State(map, place, serialized.id, serialized.assignment)
            );
        });
    });
    render(
        html`
            <h1 class="districtr-subheading">
                Where would you like to redistrict?
            </h1>
            ${listOfPlaces.render()} ${uploadPlan.render()}
        `,
        document.getElementById("root")
    );
}

/**
 * Component for loading an exported plan for editing.
 *
 * This does no validation or content-type checking, so there are
 * tons of potential errors that are not caught or responded to.
 */
class PlanUploader {
    constructor(callback) {
        this.callback = callback;
        this.render = this.render.bind(this);
        this.handleFiles = this.handleFiles.bind(this);
    }
    handleFiles(e) {
        const file = e.target.files[0];

        const reader = new FileReader();
        reader.onload = e => this.callback(e.target.result);
        reader.readAsText(file);
    }
    render() {
        return html`
            <div class="plan-loader">
                <h3>...or, load an exported plan here:</h3>
                <input type="file" @change="${this.handleFiles}" />
                <p>
                    You can export a plan as a <code>.json</code> file using the
                    "Export Plan" button in the editor.
                </p>
            </div>
        `;
    }
}

main();
