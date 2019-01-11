import { html, render } from "lit-html";
import PlanUploader from "../components/PlanUploader";
import State from "../models/State";
import PlacesList from "./components/PlacesList";
import { renderEditView } from "./edit";
import { fetchApi } from "./mockApi";

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
