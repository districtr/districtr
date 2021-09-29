import { MapState } from "../map";
import State from "../models/State";
import { html, render } from "lit-html";
import Tooltip from "../map/Tooltip";
import { Tab } from "../components/Tab";
import {
    addCOIs,
    opacityStyleExpression,
    clusterPatternStyleExpression,
    coiPatternStyleExpression,
    retrieveCOIs
} from "../layers/COI";
import DisplayPane from "../components/DisplayPane";
import { colorScheme } from "../colors";
import populateDatasetInfo from "../components/Charts/DatasetInfo";

/**
 * @desc Retrieves the proper map style; uses the same rules as the Editor.
 * @param {Object} context Context object retrieved from the database.
 * @returns {string} Proper map formatting style.
 */
 function getMapStyle() {
    return "mapbox://styles/mapbox/streets-v11";
}

function renderMap(container, coiLayer, plan, bounds) {
    // Create a new MapState to render the communities.
    const mapState = new MapState(
        container,
        {
            bounds: [bounds._sw, bounds._ne],
            fitBoundsOptions: {
                padding: {
                    top: 50,
                    right: 50,
                    left: 50,
                    bottom: 50
                }
            },
            dragPan: true
        },
        getMapStyle()
    );

    mapState.map.on("load", () => {
        // Create a new State after loading the mapState; enable drag-panning
        // and render the map. first, set the plan's columnSets property to be
        // an empty array.
        let state = new State(mapState.map, null, plan, () => { }),
            coiUnits, tooltipCallback, tooltipWatcher;

        state.plan.assignment = plan.assignment;
        state.units.map.dragPan.enable();
        state.render();

        console.dir(state);

        // Add a tooltip watcher.
        coiUnits = state.layers.find((l) => l.sourceLayer == coiLayer);
        console.dir(coiUnits);
        tooltipCallback = watchTooltips(coiLayer);
        tooltipWatcher = new Tooltip(coiUnits, tooltipCallback, 0);
        tooltipWatcher.activate();
    });
}

/**
 * @desc Renders the left Pane to the desired content; in this case, that's the
 * map.
 * @param {DisplayPane} pane The DisplayPane on the left.
 * @param {Object} plan Plan object for COIs.
 * @returns {undefined}
 */
function renderLeft(pane, coiLayer, plan, bounds) {
    // Set the inner HTML of the Pane.
    pane.inner = html`
        <div class="mapcontainer">
            <div id="map" class="map"></div>
        </div>
    `;

    // Render the template to the Pane and load the map in.
    pane.render();
    renderMap("map", coiLayer, plan, bounds);
}

/**
 * @desc Renders the right Pane.
 * @param {DisplayPane} pane The DisplayPane on the right.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderRight(pane, context) {
    let cluster = context;

    pane.inner = html`
        <h2 style="padding: 1em">${cluster.plan.name}</h2>
        <div id="cluster-display">
            ${
                cluster.plan.parts.map((coi, i) => html`
                    <div class="coi-card" style="border: 2px solid ${colorScheme[i]}">
                        <h4 style="border-bottom: 2px solid ${colorScheme[i]}">
                            ${coi.name}
                        </h4>
                        <p style="text-align: left;">
                            ${
                                coi.description ?
                                coi.description :
                                "No description is provided for this community."
                            }
                        </p>
                    </div>`
                )
            }
        </div>
    `;
    pane.render();
}

function watchTooltips(coiLayer) {
    // Specify the layer we're clicking on.

    return (features) => {
        // If we have no units we don't have to do anything!
        // if (features.length === 0) return null;

        /*
        return html`
            <div class="tooltip__text__small tooltip__text--column">
                <div style="text-align: center;">${nameString}</div>
            </div>
        `;
        */
    };
}

/**
 * @description Retrieves plan context.
 * @param {Object} place districtr-interpretable place object.
 * @returns {Promise} Promise which returns the necessary COI data.
 */
function getPlanContext(place) {
    let URL = retrieveCOIs(place);
    return fetch(URL).then(res => res.json());
}

/**
 * @desc Renders the Analysis view.
 * @returns {undefined}
 */
export default function renderAnalysisView() {
    // Create left display pane.    
    // hold on creating the right one, bc we need the mapstate first
    let { place, coiLayer, cluster, bounds } = JSON.parse(window.localStorage.getItem("coidata")),
        left = new DisplayPane({ id: "cluster-left" }),
        right = new DisplayPane({ id: "cluster-right" }),
        clusterData, tooltipWatcher, tooltipCallback;

    // The object that's returned is a context object containing a list of
    // clusters. Filter based on the cluster name to get the proper context.
    getPlanContext(place).then((context) => {
        clusterData = context[cluster];
        renderLeft(left, coiLayer, clusterData.plan, bounds);
        renderRight(right, clusterData);
    });
}

