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
function retrieveCheckboxes() {
    // First, get all the checkboxes.
    let checkboxes = Array.from(document.getElementsByClassName("cluster-checkbox"));

    // Filter to ensure we're only getting checkboxes.
    return checkboxes.filter((c) => c.localName == "label");
}

/**
 * @description Unchecks all checkboxes and forces the layer opacity to obey.
 * @param {Boolean} state Are all the checkboxes checked or unchecked?
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {String} clusterKey Unique identifier for geometries of `clusterUnits`.
 * @returns {undefined}
 */
function setCheckState(state, clusterUnits, clusterKey) {
    return (_) => {
        for (let checkbox of retrieveCheckboxes()) checkbox.control.checked = state;
        toggleClusterVisibility(clusterUnits, clusterKey)();
    };
}

/**
 * @description Tells us the status of each checkbox in the hierarchy.
 * @returns {Object[]} Array of objects which have a cluster ID, COI name, and checked status.
 */
function getCheckboxStatuses() {
    let checkboxes = retrieveCheckboxes(),
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
function onSupportingDataClicked(cluster, portal) {
    return (_) => {
        // When the cluster's button is clicked, store the cluster in local
        // storage for the new window (so it can reload when refreshed) and
        // open the window in a new tab.
        let tab = window.open(origin + "/coi-info"),
            storage = tab.localStorage;

        storage.setItem("coidata", JSON.stringify({ cluster: cluster, portal: portal }));
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
 * @description Retrieves all the stylable control elements from the DOM.
 * @returns {HTMLElement[]} Array of stylable HTML control elements.
 */
function getStylableControls() {
    let intensitySlider = document.getElementsByClassName("cluster-control__slider")[0],
        uncheckAllButton = document.getElementById("cluster-control__button-uncheck"),
        recheckAllButton = document.getElementById("cluster-control__button-check"),
        checkboxes = retrieveCheckboxes();

    return checkboxes.concat([intensitySlider, uncheckAllButton, recheckAllButton]);
}

/**
 * @description Initially style the checkboxes; this is modified when COIs are displayed.
 * @returns {undefined}
 */
function initiallyStyleCheckboxes() {
    // Get all the checkboxes *except* the first one, which is always the top-level
    // one.
    let controls = getStylableControls();

    // Style all of the checkboxes according to the initial style rules, and
    // set the background images to their patterns.
    for (let checkbox of controls) {
        checkbox.style["pointer-events"] = "none";
        checkbox.style["opacity"] = 1/2;
        checkbox.disabled = true;
    }
}

/**
 * @description Handles turning the cluster layer viz on and off.
 * @param {Object} clusterUnits Layer we're adjusting.
 * @returns {Function} Callback for Toggle.
 */
function toggleClusterLayerVisibility(clusterUnits) {
    let map = clusterUnits.map,
        layer = clusterUnits.sourceLayer;

    return (checked) => {
        // Only grab the checkboxes relating to clusters or individual COIs,
        // cutting off the one which changes the opacity for the whole layer.
        let controls = getStylableControls();

        // Disable all the checkboxes and style them accordingly.
        for (let checkbox of controls) {
            checkbox.style["pointer-events"] = checked ? "auto" : "none";
            checkbox.style["opacity"] = checked ? 1 : 1/2;
            checkbox.disabled = !checked;
        }

        // Depending on the state of the layer visibility checkbox, make the
        // entire layer visible or invisible.
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
function createLayerToggleCheckbox(callback) {
    let clusterDisplayToggle = new toggle(
            "Display Cluster Layer", false, callback, "cluster-control__checkbox",
            "cluster-control__checkbox"
        );

    return html`
        <div class="cluster-control__component cluster-control__checkbox-container">
            ${clusterDisplayToggle}
        <div>
        ${adjustToolpaneWidth()}
    `;
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
            invisible = unchecked.map((s) => s.cluster),
            opacity = getCurrentOpacity();
        
        opacityStyleExpression(clusterUnits, invisible, clusterKey, opacity);
    };
}

/**
 * @description Creates a section for each cluster.
 * @param {Object[]} clusterGroup Array of districtr-interpretable cluster objects.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {Object} patterns Maps pattern names to URLs.
 * @param {String} clusterKey Cluster unique identifier.
 * @param {String} portal URL for linking.
 * @returns {Function} Callback when the section is created.
 */
function clusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey, portal) {
    // Check if this is a single subcluster or multiple subclusters; based on
    // this, set the cluster ID and cluster name.
    let hasSubclusters = clusterGroup.length > 1,
        clusterId = hasSubclusters ? clusterGroup[0]["subclusterOf"] : "C" + clusterGroup[0][clusterKey],
        clusterName = "Cluster " + clusterId;

    return () => html`
        <div class="cluster-tile">
            <div class="cluster-tile__title">${clusterName}</div>
            ${subClusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey, portal)}
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
 * @param {String} portal Portal URL for linking.
 * @returns {HTMLTemplateElement} lit-html template element.
 */
function subClusterSection(clusterGroup, clusterUnits, clusterPatternMatch, patterns, clusterKey, portal) {
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
                    onSupportingDataClicked(cluster, portal),
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

/**
 * @desctiption Generates groups of subclusters.
 * @param {Object[]} clusters An array of districtr-interpretable cluster objects.
 * @returns {Array[]} Array of districtr-interpretable subcluster objects, grouped by parent cluster.
 */
function createClusterGroups(clusters) {
    let clusterGroups = [],
        skippable = [];

    // Iterate over the clusters, creating arrays of subclusters; if a
    // cluster's by itself in its array, then it has no subclusters. If
    // an array has multiple clusters, we display them together.
    for (let cluster of clusters) {
        // Get the subcluster for each cluster and find all the other
        // clusters with the same parent. This relies on each subcluster having
        // a property which specifies its parent cluster: this property is
        // `null` for clusters with a single subcluster, but the parent cluster's
        // identifier for clusters with more thaan one subcluster.
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
 * 
 * @param {Layer} clusterUnits districtr Layer corresponding to cluster.
 * @returns 
 */
function createControls(clusterUnits, clusterKey) {
    let layerToggle = toggleClusterLayerVisibility(clusterUnits),
        uncheckAllButton = new Button(
            setCheckState(false, clusterUnits, clusterKey),
            {
                label: "Uncheck All Clusters",
                optionalID: "cluster-control__button-uncheck",
                buttonClassName: "cluster-control__button"
            }
        ),
        recheckAllButton = new Button(
            setCheckState(true, clusterUnits, clusterKey),
            {
                label: "Check All Clusters",
                optionalID: "cluster-control__button-check",
                buttonClassName: "cluster-control__button"
            }
        );

    return () => html`
        <div class="toolbar-section cluster-control cluster-control__component">
            ${createLayerToggleCheckbox(layerToggle)}
            ${createOpacitySlider()}
            <div class="cluster-control__component cluster-control__subcomponent">
                ${uncheckAllButton}
                ${recheckAllButton}
            </div>
        </div>
    `;
}

/**
 * @description Creates an intensity slider.
 * @returns {Function} Callback with an HTMLTemplateElement.
 */
function createOpacitySlider() {
    return html`
        <div class="cluster-control__component cluster-control__slider">
            <label class="cluster-control__component" for="pattern-intensity-slider">Pattern Intensity</label>
            <input class="cluster-control__component" id="pattern-intensity-slider" type="range" value="25" max="100" min="0">
        </div>
    `;
}

/**
 * @description Handles opacity changes.
 * @param {Layer} clusterUnits districtr Layer object corresponding to COI units.
 * @returns {undefined}
 */
function handleOpacitySlider(clusterUnits, clusterKey) {
    let slider = document.getElementById("pattern-intensity-slider");

    slider.addEventListener("input", (e) => {
        toggleClusterVisibility(clusterUnits, clusterKey)();
    });
}

/**
 * @description Gets the current opacity set by the slider.
 * @returns {Number} Fractional value in [0,1] representing the opacity of the layer.
 */
function getCurrentOpacity() {
    let slider = document.getElementById("pattern-intensity-slider");
    return parseInt(slider.value)/100;
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
        shouldDisplay = spatial_abilities(place.id).coi,
        portal = spatial_abilities(place.id).portal.endpoint;

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
                tooltipCallback = watchTooltips(clusters, clusterKey),
                initialOpacity = 1/4,
                tooltipWatcher;

            // For each of the COIs, get the block groups that it
            // covers and create a mapbox style expression assigning
            // a pattern overlay to the units.
            clusterPatternStyleExpression(clusterUnits, clusterPatternMatch, clusterKey);
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            clusterUnits.setOpacity(initialOpacity);

            // Add the section for the display checkbox and the intensity.
            tab.addSection(createControls(clusterUnits, clusterKey));

            // Create arrays of subclusters to properly create the cluster tiles.
            let clusterGroups = createClusterGroups(clusters),
                section;

            // For each cluster group, add a specially styled section to the
            // tab.
            for (let clusterGroup of clusterGroups) {
                    section = clusterSection(
                        clusterGroup, clusterUnits, clusterPatternMatch, patterns,
                        clusterKey, portal
                    );
                
                // Add a section just containing the cluster toggle.
                tab.addSection(section);
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();

            // Once things have been rendered, add an even handler for the
            // opacity slider.
            handleOpacitySlider(clusterUnits, clusterKey);

            // Initially style the checkboxes and create tooltips.
            initiallyStyleCheckboxes(clusterPatternMatch, patterns);
            tooltipWatcher = new Tooltip(clusterUnits, tooltipCallback, 0);
            tooltipWatcher.activate();
        });
}

export default CoiVisualizationPlugin;
