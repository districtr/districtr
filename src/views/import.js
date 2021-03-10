import { html, render } from "lit-html";
import PlanUploader from "../components/PlanUploader";
import { loadPlanFromJSON, navigateTo, savePlanToStorage } from "../routes";

export default function renderNewPlanView() {
    const uploadPlan = new PlanUploader(fileContent => {
        loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
            savePlanToStorage(context);
            navigateTo("/edit");
        });
    });
    const target = document.getElementById("uploader");
    render(
        uploadPlan.render(),
        target
    );
}