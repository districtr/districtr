import { html, render } from "lit-html";
import PlacesList from "./components/PlacesList";
import { fetchApi } from "./mockApi";

export function renderInitialView() {
    const listOfPlaces = new PlacesList(fetchApi());
    render(
        html`
            ${listOfPlaces.render()}
        `,
        document.getElementById("places-list")
    );
}

renderInitialView();
