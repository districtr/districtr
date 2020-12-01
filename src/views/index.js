import { html, render } from "lit-html";
import initializeAuthContext, { unauthenticatedUser } from "../api/auth";
import { client } from "../api/client";
import { until } from "lit-html/directives/until";
import { PlaceMapWithData } from "../components/PlaceMap";

import PlanUploader from "../components/PlanUploader";
import { loadPlanFromJSON, navigateTo, savePlanToStorage } from "../routes";

function clearQueriesFromURL() {
    history.replaceState(
        {},
        document.title,
        window.location.href.split("?")[0]
    );
}

function renderInitialView() {
    const startDistrictingSection = document.getElementById(
        "start-districting"
    );
    render(
        until(PlaceMapWithData(), ""),
        startDistrictingSection
    );
    startDistrictingSection.classList.remove("hidden");
}

export default () => {
    renderInitialView();

    const uploadPlan = new PlanUploader(fileContent => {
        loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
            savePlanToStorage(context);
            navigateTo("/edit");
        });
    });
    render(uploadPlan.render(), document.getElementById("uploader"));


    initializeAuthContext(client).then(user => {
        clearQueriesFromURL();
        const signInHeader = document.getElementById("sign-in")
        // if (user !== unauthenticatedUser) {
        //     render(
        //         html`
        //             <p class="sign-in__link">Hello, ${user.first}!</p>
        //             <a href="/new" class="button sign-in__link"
        //                 >Draw a new plan</a
        //             >
        //             <a href="/signout" class="button sign-in__link">Sign out</a>
        //         `,
        //         signInHeader
        //     );
        // } else {
        //     render(
        //         html`
        //             <a href="/signin" class="sign-in__link">Sign in</a>
        //             <a href="/register" class="button sign-in__link">
        //                 Create your account</a
        //             >
        //         `,
        //         signInHeader
        //     );
        // }
    });
};
