import { client, createAuthMiddleware } from "./client";

export function registerUser({ first, last, email }) {
    return client.post("/register/", { first, last, email });
}

export function signInUser({ email }) {
    return client.post("/signin/", { email });
}

export function signOut() {
    localStorage.clear();
}

// Sentinel for when user cannot be authenticated (either has
// no token or the token is not validated by the backend)
export const unauthenticatedUser = {};

/**
 * Get user's identity and Bearer token. Equip the API client
 * with middleware that uses the Bearer token for authentication
 * and authorization, and return the user record.
 * @param {ApiClient} client
 * @returns {Object|unauthenticatedUser} the current user
 */
export default function initializeAuthContext(client) {
    return getBearerToken().then(token =>
        getCurrentUser(token).then(user => {
            if (user === unauthenticatedUser) {
                localStorage.removeItem("bearerToken");
            } else {
                localStorage.setItem("bearerToken", token);
                client.middleware.push(createAuthMiddleware(token));
            }
            return user;
        })
    );
}

/**
 * Given a Bearer token, verifies that token with the API and retrieves
 * the user's profile.
 * @param {string|noBearerToken} token
 * @returns {Promise<Object|unauthenticatedUser>} the current user
 */
function getCurrentUser(token) {
    const user = getUserFromToken(token);
    if (user !== unauthenticatedUser) {
        return client
            .get(`/users/${user.id}`, { Authorization: `Bearer ${token}` })
            .then(r => {
                if (r.ok) {
                    return r.json();
                } else {
                    return unauthenticatedUser;
                }
            })
            .catch(() => unauthenticatedUser);
    } else {
        return Promise.resolve(unauthenticatedUser);
    }
}

/**
 * Given a token, parse the encoded User object.
 * @param {string|noBearerToken} token
 * @returns {Object|unauthenticatedUser}
 */
export function getUserFromToken(token) {
    if (token === noBearerToken) {
        return unauthenticatedUser;
    }
    let user;
    try {
        user = atob(token.split(".")[1]);
    } catch (error) {
        // Catch encoding errors
        user = null;
    }
    if (user === undefined || user === null) {
        return unauthenticatedUser;
    } else {
        return JSON.parse(user);
    }
}

// Sentinel for when the user has no bearer token
export const noBearerToken = {};

/**
 * Retrieves Bearer token for authentication and authorization
 * with the Districtr API. Looks in localStorage first, and if that's
 * not there tries to use a sign-in token query parameter (from a
 * sign-in link) to get a Bearer token from the back-end.
 * @returns {Promise<string|noBearerToken>}
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
    if (signInToken !== noSignInToken) {
        return fetchBearerToken(signInToken);
    } else {
        return Promise.resolve(noBearerToken);
    }
}

/**
 * Given a sign-in token, fetch a Bearer token from the API to use
 * for auth in subsequent calls.
 * @param {string} signInToken
 * @returns {string|noBearerToken} the Bearer token, or sentinel
 *  noBearerToken that signals failure.
 */
export function fetchBearerToken(signInToken) {
    return (
        client
            .post("/tokens/", { token: signInToken })
            // eslint-disable-next-line no-extra-parens
            .then(r => (r.status === 201 ? r.json() : null))
            .then(payload => {
                if (payload === undefined || payload === null) {
                    return noBearerToken;
                }
                const { token } = payload;
                if (token === undefined || token === null) {
                    return noBearerToken;
                }
                return token;
            })
            .catch(() => noBearerToken)
    );
}

// Sentinel for when there is no sign-in token available
const noSignInToken = {};

/**
 * Get a sign-in token from the location bar or return the sentinel
 * indicating that no token was there
 * @returns {string, noSignInToken}
 */
function getSignInToken() {
    if (location.search.length <= "?token=".length) {
        return noSignInToken;
    }
    return location.search.slice("?token=".length);
}
