import { html, render } from "lit-html";
import { listPlaces } from "../api/mockApi";
import { PlaceMapWithData } from "../components/PlaceMap";
import { until } from "lit-html/directives/until";
import PlanUploader from "../components/PlanUploader";
import { navigateTo, loadPlan } from "../routes";

export default function renderNewPlanView() {
    const uploadPlan = new PlanUploader(json => {
        const planRecord = JSON.parse(json);
        listPlaces().then(places => {
            const place = places.find(
                p =>
                    p.id === planRecord.placeId ||
                    p.permalink === planRecord.placeId
            );
            loadPlan({
                place,
                problem: planRecord.problem,
                planId: planRecord.id,
                units: planRecord.units,
                assignment: planRecord.assignment
            });
            navigateTo("/edit");
        });
    });
    const target = document.getElementById("root");
    render(
        html`
            <div class="start-districting start-districting--alone">
                <h1 class="start-districting__title section__heading">
                    Where would you like to redistrict?
                </h1>
                ${until(PlaceMapWithData(), "")}
            </div>
            ${uploadPlan.render()}
        `,
        target
    );
}
