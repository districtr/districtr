import { html, render } from "lit-html";
import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { hydratedPlacesList } from "../components/PlacesList";

function clearQueriesFromURL() {
    history.replaceState(
        {},
        document.title,
        window.location.href.split("?")[0]
    );
}

function renderInitialView() {
    const listOfPlaces = hydratedPlacesList();
    const startDistrictingSection = document.getElementById(
        "start-districting"
    );
    render(
        html`
            <h2 class="start-districting__title">
                Where would you like to redistrict?
            </h2>
            <div id="places-list">${listOfPlaces.render()}</div>
            <div class="request-new-place">
                <h2 class="call-to-request">Looking for somewhere else?</h2>
                <a href="./request.html" class="call-to-action call-to-request"
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
        const signInHeader = document.getElementById("sign-in-header");
        if (user !== null && user !== undefined) {
            render(
                html`
                    <p class="sign-in-link">Hello, ${user.first}!</p>
                    <a href="./new.html" class="call-to-action sign-in-link"
                        >Draw a new plan</a
                    >
                    <a href="./signout.html" class="call-to-action sign-in-link"
                        >Sign out</a
                    >
                `,
                signInHeader
            );
        } else {
            render(
                html`
                    <a href="./signin.html" class="sign-in-link">Sign in</a>
                    <a
                        href="./register.html"
                        class="call-to-action sign-in-link"
                    >
                        Create your account</a
                    >
                `,
                signInHeader
            );
        }
    });
};
