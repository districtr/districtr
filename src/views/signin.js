import { signInUser } from "../api/auth";
import { createForm, errorMessage, isEmail, popupMessage } from "../form";
import { navigateTo } from "../routes";
import { handleResponse } from "../utils";

const handlers = {
    201: () => {
        document.getElementById("form").remove();
        document.getElementById("email-message").innerText =
            "Success! We sent you an email with a link to sign in.";
        window.setTimeout(() => navigateTo("/"), 2000);
    },
    404: () => {
        popupMessage({
            message:
                "It looks like you haven't created your Districtr account yet. " +
                '<a href="/register">Click here to create an account.</a>',
            raw: true
        });
    },
    default: () => {
        errorMessage("We're sorry. Signing in is currently unavailable.");
    }
};

function onSubmit({ email }) {
    signInUser({
        email: email.value
    })
        .then(handleResponse(handlers))
        .catch(() => {
            errorMessage(
                "We're having trouble accessing our sign-in service. " +
                    "Are you connected to the internet?"
            );
        });
}

function validate({ email, submit }) {
    const valid = isEmail(email.value);
    submit.disabled = !valid;
    return valid;
}

export default function main() {
    createForm(["email", "submit"], "form", validate, onSubmit);
}
