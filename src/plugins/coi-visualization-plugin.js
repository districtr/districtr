import Tooltip from "../map/Tooltip";
import { Tab } from "../components/Tab";
import {
    addCOIs,
    opacityStyleExpression,
    clusterPatternStyleExpression,
    coiPatternStyleExpression
} from "../layers/COI";
import { html, directive } from "lit-html";
import { toggle } from "../components/Toggle";
import { spatial_abilities } from "../utils";

/**
 * @description Gets the right checkboxes based on filtering.
 * @param {String} cluster Cluster identifier; optional.
 * @returns {HTMLElement[]} An array of filtered checkboxes.
 */
function retrieveCheckboxes(cluster=null) {
    // First, get all the checkboxes.
    let checkboxes = Array.from(document.getElementsByClassName("allvisible-checkbox"));

    // If a cluster name is passed, get only the checkbox associated to the cluster's
    // identifier, as well as that checkbox's children. Otherwise, get all the
    // checkboxes on the page.
    if (cluster) {
        checkboxes = checkboxes.concat(
            Array.from(document.getElementsByClassName(cluster))
        );
    } else {
        checkboxes = checkboxes.concat(Array.from(document.getElementsByClassName("cluster-checkbox")));
        checkboxes = checkboxes.concat(Array.from(document.getElementsByClassName("coi-checkbox")));
    }

    // Filter to get only the checkboxes, not paragraphs with the same classes.
    return checkboxes.filter((c) => c.localName == "label");
}

/**
 * @description Tells us the status of each checkbox in the hierarchy.
 * @param {String} cluster Cluster identifier.
 * @param {String[]} cois Array of COI names.
 * @returns {Object[]} Array of objects which have a cluster ID, COI name, and checked status.
 */
function getCheckboxStatuses(cluster=null) {
    let checkboxes = cluster ? retrieveCheckboxes(cluster) : retrieveCheckboxes(),
        checkboxStatuses = [];
    
    // If *any* of the checkboxes are unchecked, we can't view the things.
    // We also skip over any checkboxes whose COI names aren't included
    // in the list of COIs we're not displaying; this way, when users
    // mouse over the COIs, invisible ones don't show up.
    for (let checkbox of checkboxes) {
        let classes = checkbox.classList,
            numClasses = classes.length,
            cluster = numClasses > 2 ? classes[2] : null;
        
        checkboxStatuses.push({
            "cluster": cluster,
            "checked": checkbox.control.checked,
            "entity": checkbox
        });
    }

    return checkboxStatuses;
}

/**
 * @description Checks if any of the boxes in the hierarchy are checked.
 * @param {String} cluster Cluster identifier.
 * @param {String[]} cois Array of COI names.
 * @returns {Boolean} Are any of the boxes in the COI's hierarchy checked?
 */
function checkIfVisible(cluster) {
    let statuses = getCheckboxStatuses(cluster),
        allVisible = statuses.filter((s) => !s["cluster"])[0]["checked"],
        statusesInCluster = statuses.filter((s) => s["cluster"] == cluster),
        isChecked = allVisible;

    for (let status of statusesInCluster) isChecked = isChecked && status["checked"];

    return isChecked;
}

function onFeatureClicked(clusters, clusterUnits, clusterKey) {
    let map = clusterUnits.map,
        sourceLayer = clusterUnits.sourceLayer;

    map.on("click", sourceLayer, (e) => {
        // Get the first selected feature belonging to the right layer, get its
        // unique identifier, find its cluster and COI name, and check if it's
        // visible. If it is, then we want to open a new window and pass the
        // information to it.
        try {
            let selectedFeatures = map.queryRenderedFeatures(e.point, {
                    layers: [sourceLayer]
                }),
                selectedClusters = selectedFeatures.map((f) => f.properties[clusterKey]),
                selected = selectedClusters[0],
                origin = window.location.origin;

            // Check if all the things in the hierarchy are visible. If they are,
            // and the user's clicked on the thing, we want to send the data to the
            // new page.
            if (checkIfVisible(selected)) {
                let tab = window.open(origin + "/coi-info"),
                    storage = tab.localStorage,
                    cluster = clusters.find((c) => c[clusterKey] == selected);

                storage.setItem("coidata", JSON.stringify(cluster));
            }
        } catch (e) { console.error(e); };
    });
}

/**
 * @description Creates a tooltip watcher function.
 * @param {Object} unitMap Maps cluster names to maps taking COI names to units.
 * @param {String} identifier Unique identifier for units.
 * @returns {Function} Function which renders tooltips.
 */
function watchTooltips(clusters, clusterKey) {
    // Create a mapping from clusters to their long names.
    let nameMap = {};
    for (let cluster of clusters) nameMap[cluster[clusterKey]] = cluster["name"];

    return (features) => {
        // If we have no units we don't have to do anything!
        if (features.length === 0) return null;

        // Otherwise, get the names of all the hovered-over features that are
        // visible.
        let statuses = getCheckboxStatuses(),
            invisibleNames = statuses
                .filter((s) => !s.checked)
                .map((s) => s.cluster),
            names = features
                .filter((f) => !invisibleNames.includes(f.properties[clusterKey]))
                .map((f) => nameMap[f.properties[clusterKey]]),
            nameString = names.join(", ");

        if (names.length > 0) {
            return html`
                <div class="tooltip__text__small tooltip__text--column">
                    <div style="text-align: center;">${nameString}</div>
                </div>
            `;
        } else return null;
    };
}

/**
 * @description Initially style the checkboxes; this is modified when COIs are displayed.
 * @returns {undefined}
 */
function initialStyles() {
    // Get all the checkboxes *except* the first one, which is always the top-level
    // one.
    let allCheckboxes = retrieveCheckboxes().slice(1);

    // Style all of the checkboxes according to the initial style rules, and
    // set the background images to their patterns.
    for (let checkbox of allCheckboxes) {
        checkbox.style["pointer-events"] = "none";
        checkbox.style["opacity"] = 1/2;
    }
}

/**
 * @description Handles turning COI viz on and off.
 * @param {Object} units Layer we're adjusting.
 * @returns {Function} Callback for Toggle.
 */
function displayCOIs(units) {
    let map = units.map,
        layer = units.sourceLayer;

    return (checked) => {
        // Only grab the checkboxes relating to clusters or individual COIs,
        // cutting off the one which changes the opacity for the whole layer.
        let checkboxes = retrieveCheckboxes().slice(1);
        
        // Disable all the checkboxes and style them accordingly.
        for (let checkbox of checkboxes) {
            checkbox.style["pointer-events"] = checked ? "auto" : "none";
            checkbox.style["opacity"] = checked ? 1 : 1/2;
        }

        // Apparently this isn't working properly now? So confused by this.
        if (checked) map.setLayoutProperty(layer, "visibility", "visible");
        else map.setLayoutProperty(layer, "visibility", "none");
    };
}

/**
 * @description Adjusts the width of the tool pane to accommodate wider stuff.
 * @returns {Function} lit-html directive which adjusts the width of the tool pane.
 */
function adjustToolpaneWidth() {
    // This is a workaround for not being able to figure out how to call a
    // callback when things load. Instead, we create and immediately call a
    // directive, which resolves a Promise when the HTMLTemplateElement loads.
    // When the promise resolves, we do what we want. TODO: turn this directive
    // --> resolved Promise flow into a service, rather than reusing existing
    // code.
    return directive(promise => () => {
        Promise.resolve(promise).then(() => {
            let _toolPanes = document.getElementsByClassName("toolbar"),
                toolPanes = Array.from(_toolPanes),
                toolPane = toolPanes[0];

            // Adjust the width of the tool pane. This also gets animated because
            // the original animation was pretty chunky, so this makes it look
            // intentional.
            toolPane.style.width = "35vw";
            toolPane.style["max-width"] = "40vw";
        });
    })();
}

/**
 * @description Creates a checkbox which the user uses to turn on or off the COI display.
 * @param {Function} callback Callback function called whenever the checkbox is clicked.
 * @returns {HTMLTemplateElement} HTML template rendered to the browser, with a sneaky directive.
 */
function createCOICheckbox(callback) {
    return () => {
        let COIDisplayToggle = toggle(
                "Display Communities of Interest", false, callback, "",
                "allvisible-checkbox"
            );

        return html`
            <div class="toolbar-section">
                <div class="toolbar-inner-large" style="border-bottom: 1px solid #e0e0e0">
                    ${COIDisplayToggle}
                </div>
            </div>
            ${adjustToolpaneWidth()}
        `;
    };
}

function toggleClusterVisibility(clusterUnits, clusterKey) {
    return (_) => {
        // Get the statuses of the checkboxes.
        let statuses = getCheckboxStatuses(),
            unchecked = statuses.filter((s) => !s.checked),
            invisible = unchecked.map((s) => s.cluster);
        
        opacityStyleExpression(clusterUnits, invisible, clusterKey);
    };
}

/**
 * @description Creates a tab on the toolbar for checking out COIs.
 * @param {Editor} editor Districtr internal Editor object.
 * @returns {undefined}
 */
function CoiVisualizationPlugin(editor) {
    let { state, toolbar, store } = editor,
        { place } = state,
        tab = new Tab("coi", "Communities", store),
        shouldDisplay = spatial_abilities(place.id).coi;

    // If we shouldn't display COIs, just return nothing.
    if (!shouldDisplay) return;
    
    // Add COIs to the state.
    addCOIs(state)
        .then(object => {
            // Destructure the object sent to us from addCOIs.
            let {
                    clusters, clusterPatternMatch, clusterUnits, patterns,
                    clusterKey
                } = object,
                map = clusterUnits.map,
                clusterLayer = clusterUnits.sourceLayer;

            // For each of the COIs, get the block groups that it
            // covers and create a mapbox style expression assigning
            // a pattern overlay to the units.
            clusterPatternStyleExpression(clusterUnits, clusterPatternMatch, clusterKey);
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            clusterUnits.setOpacity(1/2);

            // Get display callbacks and stuff.
            let displayCallback = displayCOIs(clusterUnits),
                tooltipCallback = watchTooltips(clusters, clusterKey),
                tooltipWatcher;

            // Add the section for the checkbox.
            tab.addSection(createCOICheckbox(displayCallback));

            // For each cluster of COIs, add a dropdown section (with a checkbox
            // as its label) which allows the user to display only certain
            // clusters or certain COIs within those clusters. Unchecking any
            // cluster turns off the visualization for *any* of the COIs in the
            // cluster, and unchecking any COI only turns off the visualization
            // for that COI.
            for (let cluster of clusters) {
                let name = cluster.name,
                    identifier = cluster[clusterKey],
                    pattern = patterns[clusterPatternMatch[identifier]],
                    clusterToggle = toggle(
                        name, true,
                        toggleClusterVisibility(clusterUnits, clusterKey),
                        null, `cluster-checkbox ${identifier}`
                    );
                
                // Add a section just containing the cluster toggle.
                tab.addSection(
                    () => html`
                        <div style="opacity: 1/2; background-color: white"
                            <div 
                                class="toolbar-section-left cluster-tile"
                                style="
                                    background-image: url('${pattern}');
                                    margin-bottom: 0.5em;
                                "
                            >
                                <h4
                                    style="
                                        background-color: white;
                                        border-radius: 5%;
                                    "
                                >
                                    ${clusterToggle}
                                </h4>
                            </div>
                        </div>
                    `
                );
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();

            // Initially style the checkboxes and create tooltips.
            initialStyles(clusterPatternMatch, patterns);
            tooltipWatcher = new Tooltip(clusterUnits, tooltipCallback, 0);
            tooltipWatcher.activate();

            // Watch for click events.
            onFeatureClicked(clusters, clusterUnits, clusterKey);
        });
}

export default CoiVisualizationPlugin;
