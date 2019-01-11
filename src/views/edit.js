import { html, render } from "lit-html";
import { initializeMap } from "./Map/map";
import toolbarView from "./tools";

export function renderEditView(createState) {
    const root = document.getElementById("root");
    root.setAttribute("class", null);
    render(
        html`
            <div id="map"></div>
            <div id="toolbar"></div>
        `,
        root
    );
    const map = initializeMap("map");
    map.on("load", () => {
        let state = createState(map);
        state.units.whenLoaded(() => {
            // TODO: We can and should use lit-html to start rendering before the layers
            // are all loaded
            toolbarView(state);
        });
    });
}
