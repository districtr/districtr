import Tooltip from "../map/Tooltip";
import { Tab } from "../components/Tab";
import {
    addCOIs,
    opacityStyleExpression,
    clusterPatternStyleExpression
} from "../layers/COI";
import { html, directive } from "lit-html";
import { toggle } from "../components/Toggle";
import { spatial_abilities } from "../utils";
import Button from "../components/Button";

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
 * @description Callback for get-info buttons.
 * @param {Object} cluster districtr-interpretable COI cluster object.
 * @returns {Function} Callback for when "more info" buttons are clicked.
 */
function onClusterClicked(cluster) {
    return (e) => {
        // When the cluster's button is clicked, store the cluster in local
        // storage for the new window (so it can reload when refreshed) and
        // open the window in a new tab.
        let tab = window.open(origin + "/coi-info"),
            storage = tab.localStorage;

        storage.setItem("coidata", JSON.stringify(cluster));
    };
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
    for (let cluster of clusters) nameMap[cluster[clusterKey]] = cluster["cluster"];

    return (features) => {
        // If we have no units we don't have to do anything!
        if (features.length === 0) return null;

        // Otherwise, get the names of all the hovered-over features that are
        // visible. First, get the checkbox statuses and retrieve the clusters
        // that aren't visible. Then, get the names of the features we're
        // hovering over, filter them by their inclusion in the list of invisible
        // names, and map them to their cluster identifiers (with a "C"). Then,
        // join the names and show them to the user.
        let statuses = getCheckboxStatuses(),
            invisibleNames = statuses
                .filter((s) => !s.checked)
                .map((s) => s.cluster),
            names = features
                .filter((f) => !invisibleNames.includes(f.properties[clusterKey]))
                .map((f) => "C" + nameMap[f.properties[clusterKey]]),
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
 * @description Callback for cluster geometry visibility.
 * @param {Layer} clusterUnits districtr Layer object corresponding to cluster geometries.
 * @param {String} clusterKey Unique identifier for geometries in `clusterUnits`.
 * @returns {Function} Callback which decides which things are invisible.
 */
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
 * @description Creates a section for each cluster.
 * @param {Object[]} clusterGroup Array of districtr-interpretable cluster objects.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {Object} patterns Maps pattern names to URLs.
 * @param {String} clusterKey Cluster unique identifier.
 * @returns {Function} Callback when the section is created.
 */
function clusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey) {
    let hasSubclusters = clusterGroup.length > 1,
        clusterId = hasSubclusters ? clusterGroup[0]["subclusterOf"] : "C" + clusterGroup[0][clusterKey],
        clusterName = "Cluster " + clusterId;

    return () => html`
        <div class="cluster-tile">
            <div class="cluster-tile__title">${clusterName}</div>
            ${subClusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey)}
        </div>
    `;
}

/**
 * @description Creates a subsection for each cluster.
 * @param {Object[]} clusterGroup Array of districtr-interpretable cluster objects.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {Object} patterns Maps pattern names to URLs.
 * @param {String} clusterKey Cluster unique identifier.
 * @returns {HTMLTemplateElement} lit-html template element.
 */
function subClusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey) {
    // For each cluster grouping, create a tile. For each cluster in the grouping,
    // create a subcluster tile with that subcluster's information in it.
    return html`
        ${clusterGroup.map(cluster => {
            // For each tile in the grouping, get the required information
            // and make checkboxes and info buttons.
            let hasParent = cluster["subclusterOf"],
                name = hasParent ? cluster["subcluster"] : cluster["name"],
                identifier = cluster[clusterKey],
                pattern = patterns[clusterPatternMatch[identifier]],
                clusterToggle = toggle(
                    name, true,
                    toggleClusterVisibility(clusterUnits, clusterKey),
                    null, `cluster-checkbox ${identifier}`
                ),
                infoButton = new Button(
                    onClusterClicked(cluster),
                    {
                        label: "Supporting Data",
                        buttonClassName: "cluster-tile__button",
                        labelClassName: "cluster-tile__component cluster-tile__label"
                    }
                );

            return html`
                <div class="cluster-tile__subcluster">
                    <div class="cluster-tile__component cluster-tile__pattern" style="background-image: url('${pattern}');"></div>
                    <h4 class="cluster-tile__component cluster-tile__header">
                        ${clusterToggle}
                    </h4>
                    ${infoButton}
                </div>
            `;
        })}
    `;
}

function createClusterGroups(clusters) {
    let clusterGroups = [],
        skippable = [];

    // Iterate over the clusters, creating arrays of subclusters; if a
    // cluster's by itself in its array, then it has no subclusters. If
    // an array has multiple clusters, we display them together.
    for (let cluster of clusters) {
        // Get the subcluster for each cluster and find all the other
        // clusters with the same parent.
        let subclusterOf = cluster["subclusterOf"],
            subclusters = subclusterOf ? 
                clusters.filter((c) => c["subclusterOf"] == subclusterOf) :
                [cluster];
        
        // If this cluster is a subcluster *and* it's not already accounted
        // for, add it. Otherwise, do nothing.
        if (!skippable.includes(subclusterOf)) {
            clusterGroups.push(subclusters);
        }

        // If we have a cluster to skip, skip it. Otherwise, do nothing.
        if (subclusterOf) skippable.push(subclusterOf);
    }

    return clusterGroups;
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
                clusterLayer = clusterUnits.sourceLayer,

                // Get display callbacks and stuff.
                displayCallback = displayCOIs(clusterUnits),
                tooltipCallback = watchTooltips(clusters, clusterKey),
                tooltipWatcher;

            // For each of the COIs, get the block groups that it
            // covers and create a mapbox style expression assigning
            // a pattern overlay to the units.
            clusterPatternStyleExpression(clusterUnits, clusterPatternMatch, clusterKey);
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            clusterUnits.setOpacity(1/2);

            // Add the section for the checkbox.
            tab.addSection(createCOICheckbox(displayCallback));

            // Create arrays of subclusters to properly create the cluster tiles.
            let clusterGroups = createClusterGroups(clusters),
                section;

            // For each cluster of COIs, add a dropdown section (with a checkbox
            // as its label) which allows the user to display only certain
            // clusters or certain COIs within those clusters. Unchecking any
            // cluster turns off the visualization for *any* of the COIs in the
            // cluster, and unchecking any COI only turns off the visualization
            // for that COI.
            for (let clusterGroup of clusterGroups) {
                    section = clusterSection(
                        clusterGroup, clusterUnits, clusterPatternMatch, patterns,
                        clusterKey
                    );
                
                // Add a section just containing the cluster toggle.
                tab.addSection(section);
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();

            // Initially style the checkboxes and create tooltips.
            initialStyles(clusterPatternMatch, patterns);
            tooltipWatcher = new Tooltip(clusterUnits, tooltipCallback, 0);
            tooltipWatcher.activate();
        });
}

export default CoiVisualizationPlugin;
