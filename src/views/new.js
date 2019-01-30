import { html, render } from "lit-html";
import { listPlaces } from "../api/mockApi";
import PlacesList from "../components/PlacesList";
import PlanUploader from "../components/PlanUploader";

export function placesList() {
    const places = listPlaces();
    return new PlacesList(places, (place, problem) => {
        localStorage.setItem("place", place);
        localStorage.setItem("districtingProblem", problem);
        localStorage.removeItem("assignment");
        window.location.assign("./edit.html");
    });
}

export function renderNewPlanView() {
    const listOfPlaces = placesList();
    const uploadPlan = new PlanUploader(json => {
        const planRecord = JSON.parse(json);
        listPlaces().then(places => {
            const place = places.find(p => p.id === planRecord.placeId);
            localStorage.setItem("place", place);
            localStorage.setItem(
                "districtingProblem",
                planRecord.problem !== undefined
                    ? planRecord.problem
                    : place.districtingProblems[0]
            );
            localStorage.setItem("planId", planRecord.id);
            localStorage.setItem("assignment", planRecord.assignment);
            window.location.assign("./edit.html");
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

export function main() {
    renderNewPlanView();
}
