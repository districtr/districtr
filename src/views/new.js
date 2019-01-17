import { html, render } from "lit-html";
import PlacesList from "../components/PlacesList";
import PlanUploader from "../components/PlanUploader";
import { fetchApi } from "../mockApi";
import State from "../models/State";
import { renderEditView } from "./edit";

export function placesList() {
    const places = fetchApi();
    return new PlacesList(places, (place, problem) => {
        renderEditView(map => new State(map, place, problem));
    });
}

export function renderNewPlanView() {
    const listOfPlaces = placesList();
    const uploadPlan = new PlanUploader(json => {
        const planRecord = JSON.parse(json);
        fetchApi().then(places => {
            const place = places.find(p => p.id === planRecord.placeId);
            renderEditView(
                map =>
                    new State(
                        map,
                        place,
                        planRecord.problem !== undefined
                            ? planRecord.problem
                            : place.districtingProblems[0],
                        planRecord.id,
                        planRecord.assignment
                    )
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
