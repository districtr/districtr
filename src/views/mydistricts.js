import { html, render } from "lit-html";
import { MapState } from "../map";
import State from "../models/State";
import {
    loadPlanFromURL,
    loadPlanFromJSON,
    loadPlanFromCSV,
    getContextFromStorage,
    navigateTo
} from "../routes";
import Editor from "../models/Editor";
import ToolsPlugin from "../plugins/tools-plugin";
import PopulationBalancePlugin from "../plugins/pop-balance-plugin";

function getPlugins(context) {
    return defaultPlugins;
}

function getMapStyle(context) {
    if (context.problem.type === "community" && !["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes(context.place.id)) {
        return "mapbox://styles/mapbox/streets-v11";
    } else {
        return "mapbox://styles/mapbox/light-v10";
    }
}

const defaultPlugins = [
    ToolsPlugin,
    PopulationBalancePlugin
];

function getPlanURLFromQueryParam() {
    if (window.location.search.includes("url=")) {
        return window.location.search.split("url=")[1].split('&')[0].split("#")[0];
    } else {
        return "";
    }
}

function getPlanContext() {
    return Promise.resolve(getContextFromStorage());
}

function loadContext(context) {
    const root = document.getElementById("root");
    root.className = "";
    render(
        html`
            <div id="comparison-container" class="mapcontainer">
              <div id="map" class="map"></div>
              <div id="swipemap"></div>
            </div>
            <div id="toolbar"></div>
        `,
        root
    );
    const mapState = new MapState(
        "map",
        {
            bounds: context.units.bounds,
            fitBoundsOptions: {
                padding: {
                    top: 50,
                    right: 50,
                    left: 50,
                    bottom: 50
                }
            }
        },
        getMapStyle(context)
    );
    window.document.title = "Loading... | Districtr";

    mapState.map.on("load", () => {
        let state = new State(mapState.map, mapState.swipemap, context, () => {
            window.document.title = "Districtr";
        });
        let editor = new Editor(state, mapState, getPlugins(context));
        editor.render();
    });
}

export default function renderEditView() {
    getPlanContext().then(loadContext);
}
