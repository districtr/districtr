const API_URL = "https://api.districtr.org";

const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

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

function errorMessage(message) {
    const alert = document.getElementById("alert");
    alert.classList.remove("hidden");
    alert.innerText = message;
}

function formIsValid(first, last, email) {
    return (
        first.value.length > 0 &&
        last.value.length > 0 &&
        email.value.length > 0 &&
        email.value.match(emailRegex)
    );
}

const checkFields = (first, last, email, submit) => () => {
    if (formIsValid(first, last, email)) {
        submit.disabled = false;
    } else {
        submit.disabled = true;
    }
};

function onAllChanges(element, f) {
    element.onblur = f;
    element.onfocus = f;
    element.oninput = f;
}

export function main() {
    const form = document.getElementById("form");
    const first = document.getElementById("first");
    const last = document.getElementById("last");
    const email = document.getElementById("email");
    const submit = document.getElementById("submit");

    const onformchange = checkFields(first, last, email, submit);

    [first, last, email, submit].forEach(element =>
        onAllChanges(element, onformchange)
    );

    form.onsubmit = event => {
        event.preventDefault();
        if (!formIsValid(first, last, email)) {
            return;
        }

        registerUser({
            first: first.value,
            last: last.value,
            email: email.value
        })
            .then(response => {
                if (response.status >= 200 && response.status < 300) {
                    window.location.href = "./index.html";
                } else {
                    errorMessage(
                        "We're sorry. Registration is currently unavailable."
                    );
                }
            })
            .catch(() => {
                errorMessage(
                    "We're having trouble accessing our registration service." +
                        "Are you connected to the internet?"
                );
            });
        // need to catch errors
    };
}

main();
