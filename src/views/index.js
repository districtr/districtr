import { html, render } from "lit-html";
import netlifyIdentity from "netlify-identity-widget";
// import initializeAuthContext, { unauthenticatedUser } from "../api/auth";
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

export default () => {
    renderInitialView();
    clearQueriesFromURL();
    function asyncRenderUserLogin (user) {
        netlifyIdentity.hasDoneInit = true;
        const signInHeader = document.getElementById("sign-in");
        if (user && user.email && user.user_metadata) {
            render(
                html`
                    <p class="sign-in__link">
                        Hello, ${user.user_metadata.full_name}!
                    </p>
                    <a href="/new" class="button sign-in__link"
                        >Draw a new plan</a
                    >
                    <a
                        href="#"
                        class="button sign-in__link"
                        @click="${() => netlifyIdentity.logout()}"
                    >
                        Sign out
                    </a>
                `,
                signInHeader
            );
        } else {
            render(
                html`
                    <a
                        href="#"
                        class="sign-in__link"
                        @click="${() => netlifyIdentity.open('login')}"
                    >
                        Sign in
                    </a>
                    <a
                        href="#"
                        class="button sign-in__link"
                        @click="${() => netlifyIdentity.open('signup')}"
                    >
                        Create your account
                    </a>
                `,
                signInHeader
            );
        }
    }
    if (netlifyIdentity.hasDoneInit) {
        asyncRenderUserLogin(netlifyIdentity.currentUser());
    } else {
        netlifyIdentity.on('init', asyncRenderUserLogin);
        netlifyIdentity.init();
        netlifyIdentity.on('login', asyncRenderUserLogin);
        netlifyIdentity.on('error', console.error);
        netlifyIdentity.on('logout', asyncRenderUserLogin);
    }
};
