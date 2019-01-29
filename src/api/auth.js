import { client } from "./client";

export function registerUser({ first, last, email }) {
    return client.post("/register/", { first, last, email });
}

export function signInUser({ email }) {
    return client.post("/signin/", { email });
}

export default class AuthContext {
    constructor() {
        getBearerToken().then(token => {
            this.bearerToken = token;
        });
    }
    middleware() {
        return request => {
            if (this.bearerToken) {
                request.headers.Authorization = `Bearer ${this.bearerToken}`;
            }
            return request;
        };
    }
}

/**
 * Retrieves Bearer token for authentication and authorization
 * with the Districtr API.
 */
export function getBearerToken() {
    // Check localStorage for the Bearer token
    return new Promise(resolve => {
        let bearerToken = localStorage.getItem("bearerToken");
        if (bearerToken !== undefined && bearerToken !== null) {
            resolve(bearerToken);
        }
        // If that's missing, get signInToken from localStorage or the URL query parameters
        // and then POST that to /signin/ to get a Bearer token
        const signInToken = getSignInToken();
        if (signInToken !== null && signInToken !== undefined) {
            fetchBearerTokenAndSave(signInToken).then(token => resolve(token));
        } else {
            resolve(null);
        }
    });
}

export function fetchBearerTokenAndSave(signInToken) {
    return client
        .post("/tokens/", { token: signInToken })
        .then(response => response.json())
        .then(({ token }) => {
            localStorage.setItem("bearerToken", token);
            return token;
        });
}

function getSignInToken() {
    let signInToken = localStorage.getItem("signInToken");
    if (signInToken === undefined || signInToken === null) {
        return getSignInTokenFromURL();
    }
    return signInToken;
}

function getSignInTokenFromURL(search) {
    if (search.length <= "?token=".length) {
        return null;
    }
    const token = search.slice("?token=".length);
    localStorage.setItem("signInToken", token);
    return token;
}
