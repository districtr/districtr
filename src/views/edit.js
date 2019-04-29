import { html, render } from "lit-html";
import { initializeMap } from "../Map/map";
import State from "../models/State";
import { loadPlanFromURL, getContextFromStorage } from "../routes";
import Editor from "../models/Editor";
import ToolsPlugin from "../plugins/tools-plugin";
import EvaluationPlugin from "../plugins/evaluation-plugin";
import PopulationBalancePlugin from "../plugins/pop-balance-plugin";
import DataLayersPlugin from "../plugins/data-layers-plugin";

const plugins = [
    ToolsPlugin,
    PopulationBalancePlugin,
    DataLayersPlugin,
    EvaluationPlugin
];

function getPlanFromRoute() {
    let planId = window.location.pathname.slice("/edit/".length).trim();
    if (planId.length == 0) {
        planId = window.location.hash.slice(1).trim();
    }
    return planId.slice("chi-".length);
}

function getPlanContext() {
    const planId = getPlanFromRoute();
    if (planId.length > 0) {
        const planFile = `${planId}.json`;
        return loadPlanFromURL(`/assets/chicago-plans/${planFile}`).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan ${planId}`);
            // eslint-disable-next-line no-console
            console.error(e);
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
        const map = initializeMap("map", {
            bounds: context.units.bounds,
            fitBoundsOptions: {
                padding: {
                    top: 50,
                    right: 350,
                    left: 50,
                    bottom: 50
                }
            }
        });
        map.on("load", () => {
            let state = new State(map, context);
            let editor = new Editor(state, plugins);
            editor.render();
        });
    });
}
