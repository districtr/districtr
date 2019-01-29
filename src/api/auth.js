import { isString } from "util";
import { handleResponse } from "../utils";
import { client } from "./client";

export function registerUser({ first, last, email }) {
    return client.post("/register/", { first, last, email });
}

export function signInUser({ email }) {
    return client.post("/signin/", { email });
}

export default function initializeAuthContext(client) {
    return getBearerToken().then(token => {
        if (token !== null) {
            const authMiddleware = request => {
                request.headers.Authorization = `Bearer ${token}`;
                return request;
            };
            client.middleware.push(authMiddleware);
        }
    });
}

/**
 * Retrieves Bearer token for authentication and authorization
 * with the Districtr API.
 */
export function getBearerToken() {
    // Check localStorage for the Bearer token
    return new Promise(resolve => {
        let bearerToken = localStorage.getItem("bearerToken");
        if (!bearerToken) {
            localStorage.removeItem("bearerToken");
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

const handlers = {
    201: resp => resp.json(),
    500: () => {
        localStorage.removeItem("signInToken");
        localStorage.removeItem("bearerToken");
    }
};

export function fetchBearerTokenAndSave(signInToken) {
    return client
        .post("/tokens/", { token: signInToken })
        .then(handleResponse(handlers))
        .then(payload => {
            const { token } = payload;
            if (token !== undefined && token !== null) {
                localStorage.setItem("bearerToken", token);
            }
            return token;
        });
}

function getSignInToken() {
    let signInToken = localStorage.getItem("signInToken");
    if (signInToken === null) {
        signInToken = getSignInTokenFromURL(window.location.search);
        if (
            signInToken !== null &&
            isString(signInToken) &&
            signInToken.length > 0
        ) {
            localStorage.setItem("signInToken", signInToken);
        }
    }
    return signInToken;
}

function getSignInTokenFromURL(search) {
    if (search.length <= "?token=".length) {
        return null;
    }
    return search.slice("?token=".length);
}
