import { client } from "../api/client";
import { createForm, errorMessage, isEmail } from "../components/form";
import { navigateTo } from "../routes";
import { handleResponse } from "../utils";

function submitRequest(payload) {
    return client.post("/requests/", payload);
}

function onSubmit({
    first,
    last,
    email,
    place,
    organization,
    districtTypes,
    info
}) {
    submitRequest({
        user: {
            first: first.value,
            last: last.value,
            email: email.value,
            organization: organization.value
        },
        name: place.value,
        districtTypes: districtTypes.value,
        information: info.value
    })
        .then(
            handleResponse({
                201: () => {
                    document.getElementById("form").remove();
                    const message = document.getElementById("success-message");
                    message.innerText =
                        "Success! You request has been submitted.";
                    message.classList.remove("hidden");
                    window.setTimeout(() => navigateTo("/"), 2000);
                },
                default: () => {
                    errorMessage(
                        "We're sorry. An error occurred and we were unable to submit your request."
                    );
                }
            })
        )
        .catch(() => {
            errorMessage(
                "We're having trouble submitting your request. " +
                    "Are you connected to the internet?"
            );
        });
}

function validate({ place, districtTypes, first, last, email, submit }) {
    const valid =
        place.value.length > 0 &&
        districtTypes.value.length > 0 &&
        first.value.length > 0 &&
        last.value.length > 0 &&
        email.value.length > 0 &&
        isEmail(email.value);
    submit.disabled = !valid;
    return valid;
}

export function main() {
    createForm(
        [
            "place",
            "districtTypes",
            "info",
            "first",
            "last",
            "email",
            "organization",
            "submit"
        ],
        "form",
        validate,
        onSubmit
    );
}

main();
