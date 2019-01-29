const API_URL = "https://api.districtr.org";

function postJSON(uri, body) {
    return fetch(uri, {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    });
}

export function registerUser({ first, last, email }) {
    return postJSON(`${API_URL}/register/`, { first, last, email });
}

export function signInUser({ email }) {
    return postJSON(`${API_URL}/signin/`, { email });
}

export function getBearerToken(token) {
    postJSON(`${API_URL}/tokens/`, { token })
        .then(response => response.json())
        .then(({ token }) => {
            localStorage.setItem("bearerToken", token);
        });
}

function getSignInTokenFromURL(search) {
    const token = search.slice("?token=".length);
    localStorage.setItem("signInToken", token);
}

export function saveSignInTokenAndRedirect() {
    try {
        getSignInTokenFromURL(window.location.search);
        window.location.assign("./index.html");
    } catch (e) {
        window.location.assign("./index.html");
    }
}

export function handleResponse(handlers) {
    return response => {
        if (handlers.hasOwnProperty(response.status)) {
            handlers[response.status](response);
        } else {
            handlers.default(response);
        }
    };
}
