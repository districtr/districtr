import { html, render } from "lit-html";
import { PlaceMapWithData } from "../components/PlaceMap";
import { until } from "lit-html/directives/until";
import PlanUploader from "../components/PlanUploader";
import { loadPlanFromJSON, navigateTo, savePlanToStorage } from "../routes";

export default function renderNewPlanView() {
    // const uploadPlan = new PlanUploader(fileContent => {
    //     loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
    //         savePlanToStorage(context);
    //         navigateTo("/edit");
    //     });
    // });
    const target = document.getElementById("root");
    render(
        html`
            <div class="start-districting start-districting--alone" style="display:block">
                <h1 class="start-districting__title section__heading">
                    Where would you like to start?
                </h1>
                ${until(PlaceMapWithData(), "")}
            </div>
            <section class="l-content l-major-section">
            <p style="text-align: right; margin-right: 10%;">
                <a href="/import-export">Import an existing plan or community map</a>
            </p>
            </section>
        `,
        target
    );
}
