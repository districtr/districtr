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

// const userId = localStorage.getItem("userId");
// if (userId) {
//     fetch("https://api.districtr.org/users/" + userId)
//         .then(response => response.json())
//         .then(({ first }) => {
//             const element = document.getElementById("root");
//             element.innerText = `Hello, ${first}!`;
//         });
// }

renderInitialView();
