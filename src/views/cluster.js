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

function getBbox(features) {
    let points = features.map((f) => f.geometry.coordinates),
        x = points.map((p) => p[0]).sort((a,b) => a-b),
        y = points.map((p) => p[1]).sort((a,b) => a-b),
        [xmin, xmax] = [x[0], x[x.length-1]],
        [ymin, ymax] = [y[0], y[y.length-1]];

    return [
        [xmin, ymin],
        [xmax, ymax]
    ];
}

function renderMap(container, context, units, unitMap, clusterName) {
    // Create a MapState object from the context retrieved from the database and
    // provide it with the correct arguments to render.
    
    // Calculate the bounding box for the units inside the cluster.
    let geoids = [],
        q;

    // Get the GEOIDs for the specified units, and query on those units.
    for (let geos of Object.values(unitMap[clusterName])) geoids = geoids.concat(geos);
    q = units.map.querySourceFeatures(units.sourceId + "_points", {
        "filter": [
            "in",
            ["get", "GEOID20"],
            ["literal", geoids]
        ],
        "sourceLayer": units.sourceLayer + "_points"
    });

    // When drawing the map, allow panning and zooming but set the bounding box
    // to the boundary of the GEOIDs belonging to the cluster.
    const mapState = new MapState(
        container,
        {
            bounds: getBbox(q),
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
        // and render the map.
        let state = new State(mapState.map, null, context, () => { });
        state.units.map.dragPan.enable();
        state.render();
    });
}

/**
 * @desc Renders the left Pane to the desired content; in this case, that's the
 * map.
 * @param {DisplayPane} pane The DisplayPane om the left.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderLeft(pane, context, units, unitMap, cluster) {
    // Set the inner HTML of the Pane.
    pane.inner = html`
        <div class="mapcontainer">
            <div id="map" class="map"></div>
        </div>
    `;

    // Render the template to the Pane and load the map in.
    pane.render();
    renderMap("map", context, units, unitMap, cluster);
}

/**
 * @desc Renders the right Pane.
 * @param {DisplayPane} pane The DisplayPane on the right.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderRight(pane, clusterName, context) {
    let cluster = context.filter((c) => c.plan.id == clusterName)[0];

    pane.inner = html`
        <h2 style="padding: 1em">${cluster.plan.id}</h2>
        <div id="cluster-display">
            ${
                cluster.plan.parts.map((coi, i) => html`
                    <div class="coi-card" style="border: 2px solid ${colorScheme[i]}">
                        <h4 style="border-bottom: 2px solid ${colorScheme[i]}">
                            ${coi.name}
                        </h4>
                        <p style="text-align: justify;">
                            ${coi.description}
                        </p>
                    </div>`
                )
            }
        </div>
    `;
    pane.render();
}

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
    let { units, unitMap, place, cluster, cois, patterns } = window.coidata,
        left = new DisplayPane({ id: "cluster-left" }),
        right = new DisplayPane({ id: "cluster-right" });

    // The object that's returned is a context object containing a list of
    // clusters. Filter based on the cluster name to get the proper context.
    getPlanContext(place).then((context) => {
        let filtered = context.filter((c) => c.plan.id == cluster).shift();
        renderLeft(left, filtered.plan, units, unitMap, cluster);
        renderRight(right, cluster, context);
    });
}

