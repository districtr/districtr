import { isString } from "util";
import { handleResponse } from "../utils";
import { client } from "./client";

export function registerUser({ first, last, email }) {
    return client.post("/register/", { first, last, email });
}

export function signInUser({ email }) {
    return client.post("/signin/", { email });
}

export function signOut() {
    localStorage.clear();
}

export default function initializeAuthContext(client) {
    return getBearerToken().then(token => {
        if (token === null || token === undefined) {
            signOut();
        } else {
            localStorage.setItem("bearerToken", token);
            const authMiddleware = request => {
                request.headers.Authorization = `Bearer ${token}`;
                return request;
            };
            client.middleware.push(authMiddleware);

            const user = atob(token.split(".")[1]);
            if (user) {
                localStorage.setItem("user", user);
            }
            return JSON.parse(user);
        }
        return null;
    });
}

/**
 * Retrieves Bearer token for authentication and authorization
 * with the Districtr API.
 */
export function getBearerToken() {
    // Check localStorage for the Bearer token
    let bearerToken = localStorage.getItem("bearerToken");
    if (bearerToken !== null && bearerToken !== undefined) {
        return new Promise(resolve => resolve(bearerToken));
    }
    // If that's missing, get signInToken from the URL query parameters
    // and then POST that to /signin/ to get a Bearer token
    const signInToken = getSignInToken();
    if (signInToken !== null && signInToken !== undefined) {
        return fetchBearerToken(signInToken);
    } else {
        return new Promise(resolve => resolve(null));
    }
}

const fetchBearerTokenHandlers = {
    201: resp => resp.json(),
    default: () => null
};

export function fetchBearerToken(signInToken) {
    return client
        .post("/tokens/", { token: signInToken })
        .then(handleResponse(fetchBearerTokenHandlers))
        .then(payload => {
            if (payload === undefined || payload === null) {
                return null;
            }
            const { token } = payload;
            if (token !== undefined && token !== null) {
                return token;
            }
            return null;
        });
}

function getSignInToken() {
    let signInToken = getSignInTokenFromURL(window.location.search);
    if (
        signInToken !== null &&
        isString(signInToken) &&
        signInToken.length > 0
    ) {
        return signInToken;
    } else {
        return null;
    }
}

function getSignInTokenFromURL(search) {
    if (search.length <= "?token=".length) {
        return null;
    }
    return search.slice("?token=".length);
}
