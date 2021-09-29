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

function onFeatureClicked(place, clusterUnits, coiUnits, coiKey="GEOID20") {
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
                selectedClusters = selectedFeatures.map((f) => f.properties.label),
                cluster = selectedClusters[0],
                origin = window.location.origin;

            // Check if all the things in the hierarchy are visible. If they are,
            // and the user's clicked on the thing, we want to send the data to the
            // new page.
            if (checkIfVisible(cluster)) {
                let tab = window.open(origin + "/coi-info"),
                    storage = tab.localStorage;

                storage.setItem("coidata", JSON.stringify({
                    place: place,
                    cluster: cluster,
                    coiLayer: coiUnits.sourceLayer,
                    bounds: map.getBounds()
                }));
            }
        } catch (e) { console.error(e); };
    });
}

/**
 * @description Creates a reverse mapping from units to the COIs to which they belong.
 * @param {Object} unitMap Mapping from unit names to cluster and COI names.
 * @returns {Object} Object keyed by unit unique identifier, taken to COI names.
 */
function createReverseMapping(unitMap) {
    let reverseMapping = {};

    for (let [clusterIdentifier, cluster] of Object.entries(unitMap)) {
        for (let [coiid, geoids] of Object.entries(cluster)) {
            for (let geoid of geoids) {
                let cois = [];

                // Figuring out whether we need to add new COIs to units which are
                // mapped to twice.
                if (reverseMapping[geoid]) cois = reverseMapping[geoid]["coi"].concat([coiid]);
                else cois = [coiid];

                // Add to the reverse mapping.
                reverseMapping[geoid] = {
                    "cluster": clusterIdentifier,
                    "coi": cois
                };
            }
        }
    }

    return reverseMapping;
}

/**
 * @description Creates a tooltip watcher function.
 * @param {Object} unitMap Maps cluster names to maps taking COI names to units.
 * @param {String} identifier Unique identifier for units.
 * @returns {Function} Function which renders tooltips.
 */
function watchTooltips() {
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
                .filter((f) => !invisibleNames.includes(f.properties.label))
                .map((f) => f.properties.label),
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

/**
 * 
 * @param {String} cluster Name of the cluster we *aren't* getting.
 * @param {Object} unitMap Maps individual COI names to the units they cover.
 * @param {Array} statuses 
 * @returns 
 */
function getOtherGEOIDs(cluster, unitMap, statuses) {
    // Create a container for GEOIDs and get the clusters which are turned off
    // that *aren't* `cluster`. We do this because when a box is checked, the
    // statuses of *all other units* should be frozen; only the modified status
    // has its units made visible/invisible.
    let geoids = [],
        disabledClusters = statuses.filter((s) => 
            s.cluster && s.cluster !== cluster && !s.coi && !s.checked
        ),
        disabledClusterNames = statuses.map((s) => {
            if (s.cluster && s.cluster!== cluster && !s.coi && !s.checked) return s.cluster;
        }),
        disabledCOIs = statuses.filter((s) => 
            s.cluster !== cluster && !disabledClusterNames.includes(s.cluster)
            && s.coi && !s.checked
        );

    // For each of the disabled clusters, grab all of the GEOIDs inside them.
    for (let disabledCluster of disabledClusters) {
        // Get the mapping from COI names to GEOIDs and grab all the GEOIDs.
        let units = unitMap[disabledCluster.cluster];
        for (let geos of Object.values(units)) geoids = geoids.concat(geos);
    }

    // Now, iterate over the disabled COIs.
    for (let disabledCOI of disabledCOIs) {
        geoids = geoids.concat(unitMap[disabledCOI.cluster][disabledCOI.coi]);
    }

    return geoids;
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
 * @description Toggles the visibility of a cluster or an individual COI.
 * @param {Object} units A mapbox thing I can't quite assign a type to.
 * @param {Object} unitMap Maps COI names to units within the cluster.
 * @param {String} cluster Name of a cluster.
 * @param {String} coi Name of a COI.
 * @returns {Function} Handles the toggling action.
 */
function toggleVisibility(units, unitMap, cluster) {
    // All GEOIDs passed to `opacityStyleExpression` will have an opacity of
    // zero, and all others an opacity of 1/3 (by default). Here's the logic to
    // determine which GEOIDs are included in the list to be made invisible.
    return (checked) => {
        // Get all the checkbox statuses and create a container for GEOIDs.
        let statuses = getCheckboxStatuses(),
        geoids = [];

        // First, handle the logic for making a thing *invisible*.
        if (!checked) {
            for (let geos of Object.values(unitMap[cluster])) geoids = geoids.concat(geos);
        // Now, handle when we make things *visible*.
        } else {
            let inactive = statuses.filter((s) => !s.checked);
            for (let status of inactive) {
                for (let geos of Object.values(unitMap[status.cluster])) geoids = geoids.concat(geos);
            }
        }

        // Get the GEOIDs from all the other things.
        geoids = geoids.concat(getOtherGEOIDs(cluster, unitMap, statuses));

        // Pass the invisible IDs to the opacity expression generator.
        opacityStyleExpression(units, geoids);
    };
}

/**
 * @description Toggles the visibility of the COI layer based on zoom level.
 * @param {Object} units districtr units object.
 * @param {Number} threshold Level at which we make COIs visible/invisible.
 * @returns {undefined}
 */
function toggleOnZoom(units, threshold=7) {
    let map = units.map;

    // Callback for when the zoom level changes.
    map.on("zoom", () => {
        let zoomLevel = map.getZoom(),
            layer = units.sourceLayer;

        if (zoomLevel > threshold) map.setLayoutProperty(layer, "visibility", "visible");
        else map.setLayoutProperty(layer, "visibility", "none");
    });
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
                    clusters, unitMap, coiPatternMatch, clusterPatternMatch,
                    clusterUnits, coiUnits, patterns, clusterKey, coiKey
                } = object,
                map = clusterUnits.map,
                clusterLayer = clusterUnits.sourceLayer;

            // For each of the COIs, get the block groups that it
            // covers and create a mapbox style expression assigning
            // a pattern overlay to the units.
            clusterPatternStyleExpression(clusterUnits, clusterPatternMatch, clusterKey);
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            clusterUnits.setOpacity(1/4);

            // Get display callbacks and stuff.
            let displayCallback = displayCOIs(clusterUnits),
                tooltipCallback = watchTooltips(),
                tooltipWatcher;

            // Add the section for the checkbox.
            tab.addSection(createCOICheckbox(displayCallback));

            // For each cluster of COIs, add a dropdown section (with a checkbox
            // as its label) which allows the user to display only certain
            // clusters or certain COIs within those clusters. Unchecking any
            // cluster turns off the visualization for *any* of the COIs in the
            // cluster, and unchecking any COI only turns off the visualization
            // for that COI.
            for (let [label, cluster] of Object.entries(clusters)) {
                let identifier = cluster.plan.id,
                    name = cluster.plan.name,
                    pattern = patterns[clusterPatternMatch[label]],
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
            onFeatureClicked(place, clusterUnits, coiUnits, coiKey);

            // Watch for zoom levels.
            // toggleOnZoom(clusterUnits);
        });
}

export default CoiVisualizationPlugin;
