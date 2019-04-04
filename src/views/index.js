import { html, render } from "lit-html";
import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { until } from "lit-html/directives/until";
import { PlaceMapWithData } from "../components/PlaceMap";

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
        html`
            <h2 class="start-districting__title">
                Where would you like to redistrict?
            </h2>
            ${until(PlaceMapWithData(), "")}
            <div class="request-new-place">
                <h2 class="call-to-request">Looking for somewhere else?</h2>
                <a href="./request" class="call-to-action call-to-request"
                    >Request a new place to redistrict.</a
                >
            </div>
        `,
        startDistrictingSection
    );
    startDistrictingSection.classList.remove("hidden");
}

export default () => {
    renderInitialView();
    initializeAuthContext(client).then(user => {
        clearQueriesFromURL();
        const signInHeader = document.getElementById("sign-in");
        if (user !== null && user !== undefined) {
            render(
                html`
                    <p class="sign-in__link">Hello, ${user.first}!</p>
                    <a href="./new" class="call-to-action sign-in__link"
                        >Draw a new plan</a
                    >
                    <a href="./signout" class="call-to-action sign-in__link"
                        >Sign out</a
                    >
                `,
                signInHeader
            );
        } else {
            render(
                html`
                    <a href="./signin" class="sign-in__link">Sign in</a>
                    <a href="./register" class="call-to-action sign-in__link">
                        Create your account</a
                    >
                `,
                signInHeader
            );
        }
    });
};
