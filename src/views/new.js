import { html, render } from "lit-html";
import { listPlaces } from "../api/mockApi";
import { hydratedPlacesList } from "../components/PlacesList";
import PlanUploader from "../components/PlanUploader";
import { navigateTo } from "../routes";

function saveContextToStorage({ place, problem, id, assignment }) {
    localStorage.setItem("place", JSON.stringify(place));
    localStorage.setItem(
        "districtingProblem",
        JSON.stringify(problem || place.districtingProblems[0])
    );
    localStorage.setItem("planId", id);
    localStorage.setItem("assignment", JSON.stringify(assignment));
}

export function renderNewPlanView() {
    const listOfPlaces = hydratedPlacesList();
    const uploadPlan = new PlanUploader(json => {
        const planRecord = JSON.parse(json);
        listPlaces().then(places => {
            const place = places.find(p => p.id === planRecord.placeId);
            saveContextToStorage({
                place,
                problem: planRecord.problem,
                id: planRecord.id,
                assignment: planRecord.assignment
            });
            navigateTo("/edit");
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

renderNewPlanView();
