import { html, render } from "lit-html";
import { MapState } from "../map";
import State from "../models/State";
import { loadPlanFromURL, getContextFromStorage, navigateTo } from "../routes";
import Editor from "../models/Editor";
import ToolsPlugin from "../plugins/tools-plugin";
import EvaluationPlugin from "../plugins/evaluation-plugin";
import PopulationBalancePlugin from "../plugins/pop-balance-plugin";
import DataLayersPlugin from "../plugins/data-layers-plugin";
import CommunityPlugin from "../plugins/community-plugin";

function getPlugins(context) {
    if (context.problem.type === "community") {
        return communityIdPlugins;
    } else {
        return defaultPlugins;
    }
}

function getMapStyle(context) {
    if (context.problem.type === "community") {
        return "mapbox://styles/mapbox/streets-v11";
    } else {
        return "mapbox://styles/mapbox/light-v10";
    }
}

const defaultPlugins = [
    ToolsPlugin,
    PopulationBalancePlugin,
    DataLayersPlugin,
    EvaluationPlugin
];
const communityIdPlugins = [ToolsPlugin, DataLayersPlugin, CommunityPlugin];

function getPlanURLFromQueryParam() {
    if (window.location.search.includes("?url=")) {
        return window.location.search.slice("?url=".length).split('&')[0];
    } else {
        return "";
    }
}

function getPlanContext() {
    const planURL = getPlanURLFromQueryParam();
    if (planURL.length > 0) {
        return loadPlanFromURL(planURL).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan from ${planURL}`);
            navigateTo("/");
            // eslint-disable-next-line no-console
            console.error(e);
        });
    } else {
        return Promise.resolve(getContextFromStorage());
    }
}

function promptQuit() {
    let response = window.confirm("Would you like to return to the Districtr homepage?");
    if (response) {
        window.location.href = "/";
    } else {
        // do nothing
    }
}

export default function renderEditView() {
    getPlanContext().then(context => {
        const root = document.getElementById("root");
        root.className = "";
        render(
            html`
                <div id="map"></div>
                <a
                    class="overmapLogo"
                    @click=${promptQuit}
                    title="Districtr Home">
                    <img src="/assets/districtr-splash-tiny.png"/>
                </a>
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

        // display shorter URL
        if (window.history && window.history.replaceState
            && getPlanURLFromQueryParam()
            && window.location.hostname !== 'localhost'
            && window.location.hash && window.location.hash === "#plan") {

            let shortPlanName = getPlanURLFromQueryParam().split("/");
            shortPlanName = shortPlanName[2].replace("-plans", "") + "/"
                + shortPlanName[3].split(".")[0];
            window.history.replaceState({}, "Districtr", shortPlanName);
        }

        mapState.map.on("load", () => {
            let state = new State(mapState.map, context, () => {
                window.document.title = "Districtr";
            });
            let editor = new Editor(state, mapState, getPlugins(context));
            editor.render();
        });
    });
}
