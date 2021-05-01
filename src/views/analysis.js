
import { html, render } from "lit-html";
import DisplayPane from "../components/DisplayPane";
import Button from "../components/Button";
import { renderModal, closeModal } from "../components/Modal";
import {
    loadPlanFromURL,
    loadPlanFromJSON,
    loadPlanFromCSV,
    getContextFromStorage,
} from "../routes";
import { MapState } from "../map";
import State from "../models/State";

/**
 * @desc Retrieves a test plan if we're doing dev work, the real deal if we
 * aren't.
 * @param {String} url URL from which we load the plan.
 * @returns {Promise}
 */
function loadPlan(url) {
    if (_isDev()) return loadPlanFromURL("/assets/plans/districtr-nc-2011.json");
    return loadPlanFromURL(url);
}

/**
 * @desc Retrieves the proper map style; uses the same rules as the Editor.
 * @param {Object} context Context object retrieved from the database.
 * @returns {string} Proper map formatting style.
 */
function getMapStyle(context) {
    if (
        context.problem.type === "community"
        && !["maricopa", "phoenix", "yuma", "seaz", "nwaz"].includes((context.place || {}).id)
        && !context.units.coi2
    ) {
        return "mapbox://styles/mapbox/streets-v11";
    } else {
        return "mapbox://styles/mapbox/light-v10";
    }
}

/**
 * @desc Is this program being run in development mode?
 * @returns {boolean} See above.
 * @private
 */
function _isDev() {
    return window.location.href.includes("localhost:");
}

/**
 * @desc Renders the provided plan in the correct Pane.
 * @param {String} container HTML id tag for the Map's container element.
 * @param {object} context Plan context object as retrieved from the database.
 * @returns {undefined}
 */
function renderMap(container, context) {
    // Create a MapState object from the context retrieved from the database and
    // provide it with the correct arguments to render.
    // TODO can we use the cool street-based map for this one? I *love* that
    //  style.
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
    
    // Set a callback for when the map has loaded from the database; create a
    // new State object (which will go unused, as the user cannot edit the
    // plan while it's being analyzed) and render the map to the page. Again
    // follows the protocol set out in edit.js.
    mapState.map.on("load", () => {
        let state = new State(
            mapState.map,
            mapState.swipemap,
            context,
            () => {}
        );
        
        if (context.assignment) state.plan.assignment = context.assignment;
        state.render();
    });
}

/**
 * @desc Wrapper which returns a callback function to the "Go" button on the
 * userSelectsMode modal. Once the plan is loaded from the database (or wherever
 * else), this function renders the desired plan on the map and closes the modal.
 * @param {DisplayPane} pane Pane where the Map is going to go.
 */
function userOnGo(pane) {
    // Create a function that does the proper thing when loading.
    return e => {
        // Get the URL, JSON file, or enacted plan provided by the user.
        // TODO do the last two things.
        let url = document.getElementById("shareable-url").value,
            plan = loadPlan(url);
            
        plan.then(context => {
            // Set the inner HTML of the Pane.
            pane.inner = html`
                <div class="mapcontainer">
                    <div id="map" class="map"></div>
                    <div id="swipemap" class="map"></div>
                </div>
            `;
            
            // Render the template to the Pane, render the Map, and close the
            // Modal.
            pane.render();
            renderMap("map", context);
            closeModal();
        });
    };
}

/**
 * @desc Renders the first thing that loads on the Analysis page: a modal that
 * allows the user to select whether they want to load a map from a Districtr
 * link, load a Districtr JSON or CSV file, or choose an enacted plan to explore.
 * @param {DisplayPane} mapPane Pane in which the map will be rendered.
 * @returns {undefined}
 */
function userSelectsMode(mapPane) {
        // Find the target modal.
    let target = document.getElementById("modal"),
        
        // Create a Button element which the user can click to begin the process
        // of loading things.
        // TODO modify the ``onGo`` function to actually start loading things.
        onGo = userOnGo,
        go = Button("Go", "Evaluate the selected plan.", onGo(mapPane, target)),
        
        // Create the internal HTMLTemplate for the modal, including the
        // Button.
        template = html`
            <div class="modal-row">
                <div class="modal-item" id="url">
                    <h3>Existing</h3>
                    <p>
                        Paste the shareable URL for an existing Districtr
                        plan.
                    </p>
                    <input type="url" id="shareable-url">
                </div>
                <div class="modal-item" id="upload">
                    <h3>Upload</h3>
                    <p>
                        Upload a Districtr JSON or CSV file from your computer.
                    </p>
                </div>
                <div class="modal-item" id="enacted">
                    <h3>Enacted</h3>
                    <p>
                        Analyze an enacted districting plan.
                    </p>
                </div>
            </div>
            <div class="modal-bottom-bar">
                <div class="bottom-bar">${go}</div>
            </div>
        `,
        modal = renderModal(template);
    
    // Render inner content.
    render(modal, target);
}

/**
 * @desc Renders the Analysis view.
 * @returns {undefined}
 */
export default function renderAnalysisView() {
    // Create left and right display panes.
    let left = new DisplayPane({ id: "analysis-left" }),
        right = new DisplayPane({ id: "analysis-right" });
    
    // Spits out the Modal right when we load.
    userSelectsMode(left);
}
