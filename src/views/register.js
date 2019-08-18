import { registerUser } from "../api/auth";
import { createForm, errorMessage, isEmail } from "../form";
import { navigateTo } from "../routes";
import { handleResponse } from "../utils";

function onSubmit({ first, last, email }) {
    registerUser({
        first: first.value,
        last: last.value,
        email: email.value
    })
        .then(
            handleResponse({
                201: () => {
                    document.getElementById("form").remove();
                    document.getElementById("email-message").innerText =
                        "Success! We sent you an email with a link to sign in.";
                    window.setTimeout(() => navigateTo("/"), 2000);
                },
                default: () => {
                    errorMessage(
                        "We're sorry. Registration is currently unavailable."
                    );
                }
            })
        )
        .catch(() => {
            errorMessage(
                "We're having trouble accessing our registration service. " +
                    "Are you connected to the internet?"
            );
        });
}

function validate({ first, last, email, submit }) {
    const valid =
        first.value.length > 0 &&
        last.value.length > 0 &&
        email.value.length > 0 &&
        isEmail(email.value);
    submit.disabled = !valid;
    return valid;
}

export default function main() {
    createForm(
        ["first", "last", "email", "submit"],
        "form",
        validate,
        onSubmit
    );
}
