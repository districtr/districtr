import { html, render } from "lit-html";
import initializeAuthContext, {
    unauthenticatedUser,
    getCurrentUser
} from "../api/auth";
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
            <h2 class="start-districting__title section__heading">
                Where would you like to redistrict?
            </h2>
            ${until(PlaceMapWithData(), "")}
        `,
        startDistrictingSection
    );
    startDistrictingSection.classList.remove("hidden");
}

function verifyLoginAndSaveToken(client) {
    return getCurrentUser(client).then(user => {
        if (user === unauthenticatedUser) {
            localStorage.removeItem("bearerToken");
        } else {
            localStorage.setItem("bearerToken", client.token);
        }
        return user;
    });
}

function UserMenu(user) {
    return html`
        <p class="sign-in__link">Hello, ${user.first}!</p>
        ${user.roles.includes("admin")
            ? html`
                  <a href="./dashboard" class="button sign-in__link"
                      >Your plans</a
                  >
              `
            : html`
                  <a href="./new" class="button sign-in__link"
                      >Draw a new plan</a
                  >
              `}
        <a href="./signout" class="button sign-in__link">Sign out</a>
    `;
}

function SignInMenu() {
    return html`
        <a href="./signin" class="sign-in__link">Sign in</a>
        <a href="./register" class="button sign-in__link">
            Create your account</a
        >
    `;
}

export default () => {
    renderInitialView();
    initializeAuthContext(client)
        .then(() => verifyLoginAndSaveToken(client))
        .then(user => {
            clearQueriesFromURL();
            const signInHeader = document.getElementById("sign-in");
            render(
                user === unauthenticatedUser ? SignInMenu() : UserMenu(user),
                signInHeader
            );
        });
};
