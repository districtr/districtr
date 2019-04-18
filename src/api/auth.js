import { handleResponse, isString } from "../utils";
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

function verifyUserFromToken(token) {
    const user = atob(token.split(".")[1]);

    if (!user) {
        return Promise.resolve(unauthenticatedUser);
    }
    return fetch(`https://api.districtr.org/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` }
    }).then(r => {
        if (r.ok) {
            return { token, user: r.json() };
        } else {
            return { token, user: unauthenticatedUser };
        }
    });
}

// Sentinel for when user cannot be authenticated (either has
// no token or the token is not validated by the backend)
export const unauthenticatedUser = {};

function createAuthMiddleware(token) {
    return request => {
        request.headers.Authorization = `Bearer ${token}`;
        return request;
    };
}

export default function initializeAuthContext(client) {
    return getBearerToken()
        .then(verifyUserFromToken)
        .then(({ user, token }) => {
            if (user === unauthenticatedUser) {
                signOut();
                return unauthenticatedUser;
            } else {
                client.middleware.push(createAuthMiddleware(token));
                localStorage.setItem("bearerToken", token);
                return user;
            }
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
        return Promise.resolve(bearerToken);
    }
    // If that's missing, get signInToken from the URL query parameters
    // and then POST that to /signin/ to get a Bearer token
    const signInToken = getSignInToken();
    if (signInToken !== null && signInToken !== undefined) {
        return fetchBearerToken(signInToken);
    } else {
        return Promise.resolve(null);
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
