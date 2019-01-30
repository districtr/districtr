import { html, render } from "lit-html";
import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { hydratedPlacesList } from "../components/PlacesList";

export function renderInitialView() {
    const listOfPlaces = hydratedPlacesList();
    render(
        html`
            ${listOfPlaces.render()}
        `,
        document.getElementById("places-list")
    );
}

renderInitialView();
initializeAuthContext(client);
