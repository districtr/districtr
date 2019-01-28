import { html, render } from "lit-html";
import { placesList } from "./views/new";
import { users } from "./api";

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

users.createUser({
    first: "Joe",
    last: "Schmoe",
    email: "joe@schmoe.com"
}).then(function(json) {
    console.log(json);
}).catch(function (error) {
    console.log(error);
});