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
    }).then(res => res.json()).then(data => {
        return JSON.stringify(data.data);
    });
}

export default function renderEventView() {
    const target = document.getElementById("contentful");
    render(
        html`
            <div class="start-districting start-districting--alone">
Test
            </div>
            ${until(EventList(), "Loading events...")}
            <form action="/.netlify/functions/eventCreate" method="POST">
                <input type="text" name="name" placeholder="Name" value=""/>
                <br/>
                <input type="text" name="shortcode" placeholder="/events/__" value=""/>
                <br/>
                <input type="submit" value="Add Event"/>
            </form>
        `,
        target
    );
}
