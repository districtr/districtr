import { html, render } from "lit-html";
import { PlaceMapWithData } from "../components/PlaceMap";
import { until } from "lit-html/directives/until";
import PlanUploader from "../components/PlanUploader";
import { loadPlanFromJSON, navigateTo, savePlanToStorage } from "../routes";
import { onlyCommunities } from "../components/PlacesList";

export default function renderNewPlanView() {
    onlyCommunities();
    const uploadPlan = new PlanUploader(fileContent => {
        loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
            savePlanToStorage(context);
            navigateTo("/edit");
        });
    });
    const target = document.getElementById("root");
    render(
        html`
            <div class="start-districting start-districting--alone">
                <h1 class="start-districting__title section__heading">
                    Where would you like to identify a community?
                </h1>
                ${until(PlaceMapWithData(), "")}
            </div>
            ${uploadPlan.render()}
        `,
        target
    );
}
