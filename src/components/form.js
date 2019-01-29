export function popupMessage({ message, raw }) {
    const messageElement = document.getElementById("popup-message");
    messageElement.classList.remove("hidden");
    if (raw === true) {
        messageElement.innerHTML = message;
    } else {
        messageElement.innerText = message;
    }
    return messageElement;
}

export function errorMessage(message) {
    const element = popupMessage({ message });
    element.classList.add("alert");
}

export const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export function isEmail(value) {
    return value.match(emailRegex);
}

function onAllChanges(element, f) {
    element.onblur = f;
    element.onfocus = f;
    element.oninput = f;
}

export function createForm(elementIds, formId, validate, onSubmit) {
    const elements = elementIds.reduce((lookup, elementId) => {
        const element = document.getElementById(elementId);
        return { ...lookup, [elementId]: element };
    }, {});

    elementIds.forEach(elementId => {
        onAllChanges(elements[elementId], () => validate(elements));
    });

    const form = document.getElementById(formId);
    form.onsubmit = event => {
        event.preventDefault();
        if (!validate(elements)) {
            return;
        }
        onSubmit(elements);
    };
}
