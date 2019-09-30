import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";
import { navigateTo } from "../routes";

function EventList() {
    let selectedId = location.pathname
        .split("/")
        .slice(-1)[0]
        .toLowerCase();
    return fetch("/.netlify/functions/eventRead", {
        method: "POST",
        data: JSON.stringify({ shortcode: selectedId })
    })
    .then(res => res.json())
    .then(eventlist => {
        return eventlist.data.map((evt) => {
            return html`
                <li class="event">
                    <a href="/event/${evt.shortcode}">
                        <h4>${evt.name}</h4>
                        in ${evt.map}
                    </a>
                </li>
            `;
        });
    })
    .catch(() => {
        return html`
            <div>Test Me</div>
        `;
    });
}

function createEvent() {
    let btn = document.getElementById("event_submit");
    btn.innerText = "Saving...";
    btn.disabled = true;

    let name = document.getElementById("event_name").value,
        map = document.getElementById("event_map").value,
        shortcode = document.getElementById("event_shortcode").value;

    fetch("/.netlify/functions/eventCreate", {
        method: "POST",
        body: JSON.stringify({
            name: name,
            shortcode: shortcode,
            map: map
        })
    })
    .then(res => res.json())
    .then((e) => {
        navigateTo("/event/" + shortcode);
    });
}

export default function renderEventView() {
    const target = document.getElementById("contentful");
    render(
        html`
            <div>
                ${until(EventList(), "Loading events...")}
            </div>
            <div class="event-form">
                <li class="option-list__item">
                    <label class="ui-label">Event Name</label>
                    <input
                        id="event_name"
                        class="text-input"
                    />
                </li>
                <li class="option-list__item">
                    <label class="ui-label">URL shortcode (/event/___)</label>
                    <input
                        id="event_shortcode"
                        class="text-input"
                    />
                </li>
                <li class="option-list__item">
                    <select id="event_map">
                        <option value="nc">North Carolina</option>
                    </select>
                </li>
                <button
                    id="event_submit"
                    class="button button--submit button--alternate ui-label"
                    @click="${createEvent}"
                >
                    Add Event
                </button>
            </div>
        `,
        target
    );
}
