import { html, render } from "lit-html";
import { MapState } from "../map";
import Layer from "../map/Layer";
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
import EvaluationPlugin from "../plugins/evaluation-plugin";
import PopulationBalancePlugin from "../plugins/pop-balance-plugin";
import DataLayersPlugin from "../plugins/data-layers-plugin";
import CommunityPlugin from "../plugins/community-plugin";
import MultiLayersPlugin from "../plugins/multi-layers-plugin";
import { spatial_abilities, boundsOfGJ } from "../utils";

function getPlugins(context) {
    if (context.units.coi2) {
        return [ToolsPlugin, MultiLayersPlugin, CommunityPlugin];
    } else if (context.problem.type === "community") {
        return communityIdPlugins;
    } else {
        return defaultPlugins;
    }
}

function getMapStyle(context) {
    if (context.problem.type === "community" && !["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes((context.place || {}).id) && !context.units.coi2) {
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
    if (window.location.search.includes("url=")) {
        return window.location.search.split("url=")[1].split('&')[0].split("#")[0];
    } else {
        return "";
    }
}

function getPlanContext() {
    const planURL = getPlanURLFromQueryParam();
    let finalURLpage = window.location.pathname.split("/").slice(-1)[0];
    if (planURL.length > 0) {
        return loadPlanFromURL(planURL).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan from ${planURL}`);
            navigateTo("/");
            // eslint-disable-next-line no-console
            console.error(e);
        });
    } else if (!["edit", "coi", "plan"].includes(finalURLpage.toLowerCase())) {
        // remove token; save a new plan
        localStorage.removeItem("districtr_token_" + finalURLpage);
        // load JSON plan from DB
        if (isNaN(finalURLpage * 1)) {
            // original _id plans
            finalURLpage = '&_id=' + finalURLpage;
        }
        return loadPlanFromURL(`/.netlify/functions/planRead?id=${finalURLpage}`).catch(e => {
            console.error(`Could not load plan ${finalURLpage} from database`);
            navigateTo("/");
            console.error(e);
        });
    } else {
        return Promise.resolve(getContextFromStorage());
    }
}

function loadContext(context) {
    const root = document.getElementById("root");
    root.className = "";
    render(
        html`
            <div id="comparison-container" class="mapcontainer">
              <div id="map" class="map"></div>
              <div id="swipemap" class="map"></div>
            </div>
            <div id="toolbar"></div>
            <div class="print-only print-summary"></div>
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
                    right: context.units.coi2 ? 250 : 50,
                    left: 50,
                    bottom: 50
                }
            }
        },
        getMapStyle(context)
    );
    if (context.units.coi2) {
        document.body.className = "coi2";
    }
    window.document.title = "Loading... | Districtr";

    // display shorter URL
    if (window.history && window.history.replaceState
        && getPlanURLFromQueryParam()
        && window.location.hostname !== 'localhost'
        && window.location.hash && window.location.hash === "#plan") {

        let shortPlanName = getPlanURLFromQueryParam().split("/");
        shortPlanName = shortPlanName[2].replace("-plans", "") + "/"
            + shortPlanName[3].split(".")[0]
            + window.location.search.replace("url=" + shortPlanName.join("/"), "");
        if (shortPlanName[shortPlanName.length - 1] === "?") {
            shortPlanName = shortPlanName.substring(0, shortPlanName.length - 1);
        }
        window.history.replaceState({}, "Districtr", shortPlanName);
    }

    // block of event handlers; drop a file onto the map
    function planHandler(f) {
        let plan = f.getAsFile(),
            pname = plan.name.toLowerCase();
        if (pname.includes(".json") || pname.includes(".geojson") || pname.includes(".csv")) {
            let reader = new FileReader();
            reader.onload = (e) => {
                localStorage.setItem(
                    "jsonload_viewstate",
                    document.querySelector("input[name=tabs]:checked").value
                );
                if (pname.includes(".json") || pname.includes(".geojson")) {
                    let planData = JSON.parse(reader.result);
                    if (planData.type === "Feature" || planData.type === "FeatureCollection") {
                        // load GeoJSON / Representable
                        let rnd = Math.round(Math.random() * 100000);
                        mapState.map.addSource('gj_up_' + rnd, {
                          type: 'geojson',
                          data: planData
                        });
                        new Layer(
                            mapState.map,
                            {
                                id: 'gj_up_' + rnd,
                                source: 'gj_up_' + rnd,
                                type: "fill",
                                paint: {
                                    "fill-color": "#f44",
                                    "fill-opacity": 0.3
                                }
                            }
                        );

                        let bnd = boundsOfGJ(planData);
                        mapState.map.fitBounds([
                          [bnd[0], bnd[1]],
                          [bnd[2], bnd[3]]
                        ]);
                        return;
                    }
                    if (planData.place.id !== context.place.id) {
                        let conf = window.confirm("Switch locations to load this plan file?");
                        if (!conf) {
                            return;
                        }
                    }
                    loadPlanFromJSON(planData).then(loadContext);
                } else {
                    // CSV
                    try {
                        loadPlanFromCSV(reader.result, context).then(loadContext);
                    } catch (e) {
                        window.alert(e.message);
                    }
                }
            };
            reader.readAsText(plan);
        }
    }
    document.body.ondrop = (ev) => {
        ev.preventDefault();
        if (ev.dataTransfer.items && ev.dataTransfer.items.length) {
            planHandler(ev.dataTransfer.items[0]);
        } else if (ev.dataTransfer.files && ev.dataTransfer.files.length) {
            planHandler(ev.dataTransfer.files[0]);
        }
    };
    document.body.ondragover = (ev) => {
        ev.preventDefault();
    };

    mapState.map.on("load", () => {
        let state = new State(mapState.map, mapState.swipemap, context, () => {
            window.document.title = "Districtr";
        });
        if (context.assignment) {
            state.plan.assignment = context.assignment; // know loaded district assignments
        }
        let editor = new Editor(state, mapState, getPlugins(context));
        editor.render();
    });
}

export default function renderEditView() {
    getPlanContext().then(loadContext);
}
