import { html, render } from "lit-html";
import { initializeMap } from "../Map/map";
import State from "../models/State";
import { getContextFromStorage } from "../routes";
import Editor from "../models/Editor";
import ToolsPlugin from "../plugins/tools-plugin";
import DataLayersPlugin from "../plugins/data-layers-plugin";
import { CommunityPlugin } from "../plugins/community-plugin";

const plugins = [ToolsPlugin, DataLayersPlugin, CommunityPlugin];

function getPlanContext() {
    return Promise.resolve(getContextFromStorage());
}

export default function renderEditView() {
    getPlanContext().then(context => {
        const root = document.getElementById("root");
        root.className = "";
        render(
            html`
                <div id="map"></div>
                <div id="toolbar"></div>
            `,
            root
        );
        const map = initializeMap(
            "map",
            {
                bounds: context.units.bounds,
                fitBoundsOptions: {
                    padding: {
                        top: 50,
                        right: 350,
                        left: 50,
                        bottom: 50
                    }
                }
            },
            "mapbox://styles/mapbox/streets-v9"
        );
        map.on("load", () => {
            map.setMaxBounds(map.getBounds());
            let state = new State(map, context);
            let editor = new Editor(state, plugins);
            editor.render();
        });
    });
}
