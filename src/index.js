import { html, render } from "lit-html";
import { placesList } from "./views/new";

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
