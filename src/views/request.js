import { createForm, errorMessage, isEmail } from "../form";
import { navigateTo } from "../routes";
import { handleResponse } from "../utils";

function submitRequest(payload) {
    return fetch("/", {
      method: 'POST',
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        ...payload,
        "form-name": "requestPlace",
      }).toString()
    });
}

function onSubmit({
    first,
    last,
    email,
    pl,
    organization,
    districtTypes,
    districtData,
}) {
    submitRequest({
        first: first.value,
        last: last.value,
        email: email.value,
        organization: organization.value,
        place: place.value,
        districtTypes: districtTypes.value,
        districtData: districtData.value
    })
        .then(
            handleResponse({
                200: () => {
                    document.getElementById("form").remove();
                    const message = document.getElementById("success-message");
                    message.innerText =
                        "Success! Your request has been submitted.";
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

function validate({ pl, districtTypes, first, last, email, submit }) {
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

export default function main() {
    createForm(
        [
            "place",
            "districtTypes",
            "districtData",
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
