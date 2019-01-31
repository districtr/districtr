import { html, render } from "lit-html";
import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { hydratedPlacesList } from "../components/PlacesList";

export function renderInitialView() {
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

renderInitialView();
initializeAuthContext(client);
