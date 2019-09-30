import { html, render } from "lit-html";
import { until } from "lit-html/directives/until";
import { navigateTo } from "../routes";
import { available } from "../components/PlaceMap";
import { PlacesListForState } from "../components/PlacesList";

function renderEvent(evt) {
    return html`
        <li class="event">
            <strong>${evt.name} - <a href="/event/${evt.shortcode}">direct link</a></strong>
            ${PlacesListForState(evt.map).render()}
        </li>
    `;
}

function EventList() {
    // see if this is ALL events (/event) or ONE event (/event/__)
    let selectedId = location.pathname
        .split("/")
        .slice(-1)[0]
        .toLowerCase();
    if (selectedId === "event") {
        selectedId = undefined;
    } else {
        document.getElementById("headline").innerText = "My Event";
        //document.getElementById("event-form").style.display = "none";
    }

    // use Netlify serverless functions to look up event by shortcode
    return fetch("/.netlify/functions/eventRead", {
        method: "POST",
        body: JSON.stringify({ shortcode: selectedId })
    })
    .then(res => res.json())
    .then(eventlist => {
        return eventlist.data.map(renderEvent);
    })
    .catch(() => {
        // if you are offline, just use a filler event
        return renderEvent({
            shortcode: "test",
            name: "Local",
            map: "North Carolina"
        });
    });
}

function createEvent() {
    // prevent double-click on event
    let btn = document.getElementById("event_submit");
    btn.innerText = "Saving...";
    btn.disabled = true;

    let name = document.getElementById("event_name").value,
        map = document.getElementById("event_map").value,
        shortcode = document.getElementById("event_shortcode").value
            .toLowerCase().replace(/\s+/g, "");

    // POST event details to Netlify serverless functions
    // stores event in MongoDB
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
        // redirect to focus on this one event
        navigateTo("/event/" + shortcode);
    });
}

export default function renderEventView() {
    const target = document.getElementById("contentful");
    render(
        html`
            <div class="event-list">
                ${until(EventList(), "Loading events...")}
            </div>
            <div id="event-form" class="event-form">
                <h2>New Event</h2>
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
                        ${available.map(state => {
                            return html`
                                <option value="${state}">${state}</option>
                            `;
                        })}
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
