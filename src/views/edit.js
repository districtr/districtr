import { html, render } from "lit-html";
import { MapState } from "../Map/map";
import State from "../models/State";
import {
    getContextFromStorage,
    navigateTo,
    loadPlanFromBackend
} from "../routes";
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

function getPlanFromRoute() {
    // We expect the url to look like /plans/{planId}/edit or /edit/{planId}
    // So, splitting on "/" gives ["", "plans", planId, "edit"] or ["", "edit", planId].
    // In both cases, we want the second component.
    let urlComponents = window.location.pathname.split("/");
    let planId = urlComponents[2] || "";
    if (planId.length == 0) {
        planId = window.location.hash.slice(1).trim();
    }
    // return planId.slice("chi-".length);
    return planId;
}

function getPlanContext() {
    const planId = getPlanFromRoute();
    if (planId.length > 0) {
        // const planFile = `${planId}.json`;
        return loadPlanFromBackend(planId).catch(e => {
            // return loadPlanFromURL(`/assets/chicago-plans/${planFile}`).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan ${planId}`);
            // eslint-disable-next-line no-console
            console.error(e);
            // navigateTo("/new");
        });
    } else {
        return Promise.resolve(getContextFromStorage());
    }
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
        const mapState = new MapState(
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
            getMapStyle(context)
        );
        window.document.title = "Loading... | Districtr";
        mapState.map.on("load", () => {
            let state = new State(mapState.map, context, () => {
                window.document.title = "Districtr";
            });
            let editor = new Editor(state, mapState, getPlugins(context));
            editor.render();
        });
    });
}
