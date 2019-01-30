import { html, render } from "lit-html";
import initializeAuthContext from "../api/auth";
import { client } from "../api/client";
import { placesList } from "./new";

export function renderInitialView() {
    const listOfPlaces = placesList();
    render(
        html`
            ${listOfPlaces.render()}
        `,
        document.getElementById("places-list")
    );
}

renderInitialView();
initializeAuthContext(client);
