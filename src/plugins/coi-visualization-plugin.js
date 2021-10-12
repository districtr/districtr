import Tooltip from "../map/Tooltip";
import { Tab } from "../components/Tab";
import {
    addCOIs,
    opacityStyleExpression,
    clusterPatternStyleExpression,
    borderStyleExpression
} from "../layers/COI";
import { html, directive } from "lit-html";
import { toggle } from "../components/Toggle";
import { spatial_abilities } from "../utils";
import Button from "../components/Button";

// Global styling parameters. Each has a blank space prepended so, in the event
// they're concatenated, don't meld into each other.
const defaultPatternStyles = " cluster-tile__button cluster-tile__button-toggle button--alternate",
    activePatternStyles = " cluster-tile__button-toggle-active",
    defaultHighlightStyles = " cluster-tile__button cluster-tile__highlight button--alternate",
    activeHighlightStyles = " cluster-tile__highlight-active",
    uncheckAllButtonClass = " cluster-control__button-uncheck",
    nextButtonClass = " cluster-control__button-next",
    previousButtonClass = " cluster-control__button-previous",
    sliderControlClass = " cluster-control__slider";

/**
 * @description Gets checkbox buttons.
 * @returns {HTMLElement[]} An array of checkbox buttons.
 */
function retrieveCheckboxButtons() {
    return Array.from(document.getElementsByClassName("cluster-tile__button-toggle"));
}

/**
 * @description Gets highlight buttons.
 * @returns {HTMLElement[]} An array of highlight buttons.
 */
function retrieveHighlightButtons() {
    return Array.from(document.getElementsByClassName("cluster-tile__highlight"));
}

/**
 * @description Re-styles the provided button to minimize code reuse.
 * @param {HTMLElement} button HTML `button` entity to be re-styled.
 * @param {Boolean} on Whether we're turning this button on or off.
 * @returns {undefined}
 */
function toggleHighlightButtonStyles(button, on) {
    if (on) {
        button.className = defaultHighlightStyles + activeHighlightStyles;
        button.active = true;
        button.innerHTML = "Hide Border";
    } else {
        button.className = defaultHighlightStyles;
        button.active = false;
        button.innerHTML = "Show Border";
    }
}

/**
 * @description Re-styles the provided button to minimize code reuse.
 * @param {HTMLElement} button HTML `button` entity to be re-styled.
 * @param {Boolean} on Whether we're turning this button on or off.
 * @returns {undefined}
 */
 function togglePatternButtonStyles(button, on) {
    if (on) {
        button.className = defaultPatternStyles + activePatternStyles;
        button.checked = true;
        button.innerHTML = "Hide Pattern";
    } else {
        button.className = defaultPatternStyles;
        button.checked = false;
        button.innerHTML = "Show Pattern";
    }
}

/**
 * @description Makes everything invisible.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Layer} clusterUnitsLines districtr Layer object for cluster units' borders.
 * @param {String} clusterKey Unique identifier for geometries of `clusterUnits`.
 * @returns {undefined}
 */
function makeAllInvisible(clusterUnits, clusterUnitsLines, clusterKey) {
    return (_) => {
        for (let button of retrieveCheckboxButtons()) {
            togglePatternButtonStyles(button, false);
        }

        // Make everything invisible.
        let invisible = getCheckboxButtonStatuses().map((c) => c["cluster"]),
            opacity = getCurrentOpacity();

        opacityStyleExpression(clusterUnits, invisible, clusterKey, opacity);
        borderStyleExpression(clusterUnitsLines, null, clusterKey);
    };
}

/**
 * @description Hides all the unit borders when all clusters are hidden.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {String} clsuterKey Cluster unique identifier.
 * @returns {Function} Callback when the "hide all" button is clicked.
 */
function hideAllBorders(clusterUnits, clusterKey) {
    return (_) => {
        let buttons = retrieveHighlightButtons();

        // Reset all the stuff.
        for (let button of buttons) toggleHighlightButtonStyles(button, false);
        borderStyleExpression(clusterUnits, null, clusterKey);
    };
}

/**
 * @description Tells us the status of each checkbox in the hierarchy.
 * @returns {Object[]} Array of objects which have a cluster ID, COI name, and checked status.
 */
function getCheckboxButtonStatuses() {
    let buttons = retrieveCheckboxButtons(),
        checkboxStatuses = [];

    // If *any* of the checkboxes are unchecked, we can't view the things.
    // We also skip over any checkboxes whose COI names aren't included
    // in the list of COIs we're not displaying; this way, when users
    // mouse over the COIs, invisible ones don't show up.
    for (let button of buttons) {
        checkboxStatuses.push({
            "cluster": button.id,
            "checked": button.checked,
            "entity": button
        });
    }

    return checkboxStatuses;
}

/**
 * @description Callback for get-info buttons.
 * @param {Object} cluster districtr-interpretable COI cluster object.
 * @returns {Function} Callback for when "more info" buttons are clicked.
 * @returns {undefined}
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
    for (let cluster of clusters) {
        for (let subcluster of cluster["subclusters"]) {
            nameMap[subcluster[clusterKey]] = subcluster[clusterKey];
        }
    }

    return (features) => {
        // If we have no units we don't have to do anything!
        if (features.length === 0) return null;

        // Otherwise, get the names of all the hovered-over features that are
        // visible. First, get the checkbox statuses and retrieve the clusters
        // that aren't visible. Then, get the names of the features we're
        // hovering over, filter them by their inclusion in the list of invisible
        // names, and map them to their cluster identifiers (with a "C"). Then,
        // join the names and show them to the user.
        let statuses = getCheckboxButtonStatuses(),
            invisibleNames = statuses
                .filter((s) => !s.checked)
                .map((s) => s.cluster),
            names = features
                .filter((f) => Object.values(nameMap).includes(f.properties[clusterKey]))
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
    let intensitySlider = document.getElementsByClassName(sliderControlClass)[0],
        uncheckAllButton = document.getElementById(uncheckAllButtonClass),
        nextButton = document.getElementById(nextButtonClass),
        previousButton = document.getElementById(previousButtonClass),
        highlightClusterButtons = retrieveHighlightButtons(),
        checkboxes = retrieveCheckboxButtons();

    return checkboxes
        .concat([intensitySlider, uncheckAllButton, nextButton, previousButton])
        .concat(highlightClusterButtons);
}

/**
 * @description Initially style the controls; this is modified when COIs are displayed.
 * @returns {undefined}
 */
function initiallyStyleCheckboxButtons() {
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
 * @param {Layer} clusterUnits districtr Layer we're adjusting.
 * @param {Layer} clusterUnitsLines districtr line Layer we're adjusting.
 * @param {String} clusterKey Unique cluster identifier.
 * @returns {Function} Callback for Toggle.
 */
function toggleClusterLayerVisibility(clusterUnits, clusterUnitsLines, clusterKey) {
    let map = clusterUnits.map,
        clusterLayer = clusterUnits.id,
        borderLayer = clusterUnitsLines.id,
        initialized = false;

    return (checked) => {
        // Only grab the checkboxes relating to clusters or individual COIs,
        // cutting off the one which changes the opacity for the whole layer.
        let controls = getStylableControls(),
            checkboxButtons = retrieveCheckboxButtons(),
            highlightButtons = retrieveHighlightButtons();

        // Enable controls.
        for (let checkbox of controls) {
            checkbox.style["pointer-events"] = checked ? "auto" : "none";
            checkbox.style["opacity"] = checked ? 1 : 1/2;
            checkbox.disabled = !checked;
        }

        // If this is the first time we're enabling the layer, only make the *first*
        // cluster visible.
        if (!initialized) {
            let firstPattern = checkboxButtons.shift(),
                firstHighlight = highlightButtons.shift(),
                opacity = getCurrentOpacity(),
                invisible = checkboxButtons
                    .map((c) => c["id"])
                    .filter((c) => c.toString() !== firstPattern["id"].toString());

            // Show fill and border stuff.
            opacityStyleExpression(clusterUnits, invisible, clusterKey, opacity);
            borderStyleExpression(clusterUnitsLines, firstPattern["id"], clusterKey);

            // Style the checkbox.
            togglePatternButtonStyles(firstPattern, true);
            toggleHighlightButtonStyles(firstHighlight, true);

            // We're initialized!
            initialized = true;
        }

        // Depending on the state of the layer visibility checkbox, make the
        // entire layer visible or invisible.
        if (checked) {
            map.setLayoutProperty(clusterLayer, "visibility", "visible");
            map.setLayoutProperty(borderLayer, "visibility", "visible");
        } else {
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            map.setLayoutProperty(borderLayer, "visibility", "none");
        }
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
            "Show Cluster Layer", false, callback, "cluster-control__checkbox",
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
 * @description Callback for cluster broder visibility.
 * @param {Layer} clusterUnits districtr Layer object corresponding to cluster geometries.
 * @param {String} clusterKey Unique identifier for geometries in `clusterUnits`.
 * @returns {Function} Callback which decides which borders are visible.
 */
function toggleClusterBorderVisibility(clusterUnits, clusterIdentifier, clusterKey) {
    return (e) => {
        let button = e.target,
            otherButtons = retrieveHighlightButtons()
                .filter((b) => b["id"] !== clusterIdentifier);

        // Set some styles on the button based on its state. If the button's
        // active and we're making it not active, then we want to re-style it,
        // turn off the layer's border styling, and re-set its state. Otherwise,
        // do the opposite.
        if (button.active) {
            toggleHighlightButtonStyles(button, false);
            borderStyleExpression(clusterUnits, null, clusterKey);
        } else if (!button.active) {
            // Modify the classes.
            toggleHighlightButtonStyles(button, true);
            for (let other of otherButtons) toggleHighlightButtonStyles(other, false);

            // Add the border to the map.
            borderStyleExpression(clusterUnits, clusterIdentifier, clusterKey);
        }
    };
}

/**
 * @description Callback for cluster geometry visibility.
 * @param {Layer} clusterUnits districtr Layer object corresponding to cluster geometries.
 * @param {String} clusterKey Unique identifier for geometries in `clusterUnits`.
 * @returns {Function} Callback which decides which things are invisible.
 */
function toggleClusterVisibility(clusterUnits, clusterKey) {
    return (e) => {
        // Change the button style and state if we're calling this for an
        // individual cluster.
        if (e) {
            // Toggle the cluster's state and modify its style.
            let button = e.target;
            togglePatternButtonStyles(button, !button.checked);
        }

        // Get the statuses of the checkbox buttons.
        let statuses = getCheckboxButtonStatuses(),
            unchecked = statuses.filter((s) => !s["checked"]),
            invisible = unchecked.map((s) => s["cluster"]),
            opacity = getCurrentOpacity();
        
        opacityStyleExpression(clusterUnits, invisible, clusterKey, opacity);
    };
}

/**
 * @description Creates a section for each cluster.
 * @param {Object[]} clusterGroup Array of districtr-interpretable cluster objects.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Layer} clusterUnitsLines districtr Layer object for cluster unit *borders*.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {Object} patterns Maps pattern names to URLs.
 * @param {String} clusterKey Cluster unique identifier.
 * @param {String} portal URL for linking.
 * @returns {Function} Callback when the section is created.
 */
function clusterSection(
        cluster, clusterUnits, clusterUnitsLines, clusterPatternMatch,
        patterns, clusterKey, portal
    ) {
    // Check if this is a single subcluster or multiple subclusters; based on
    // this, set the cluster ID and cluster name.
    let clusterName = "Cluster C" + cluster[clusterKey] + " – " + cluster["name"];

    return () => html`
        <div class="cluster-tile">
            <div class="cluster-tile__title">${clusterName}</div>
            ${
                subClusterSection(
                    cluster["subclusters"], clusterUnits, clusterUnitsLines,
                    clusterPatternMatch, patterns, clusterKey, portal
                )
            }
        </div>
    `;
}

/**
 * @description Creates a subsection for each cluster.
 * @param {Object[]} subclusters Array of districtr-interpretable cluster objects.
 * @param {Layer} clusterUnits districtr Layer object for cluster units.
 * @param {Layer} clusterUnitsLines districtr Layer object for cluster unit *borders*.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {Object} patterns Maps pattern names to URLs.
 * @param {String} clusterKey Cluster unique identifier.
 * @param {String} portal Portal URL for linking.
 * @returns {HTMLTemplateElement} lit-html template element.
 */
function subClusterSection(
        subclusters, clusterUnits, clusterUnitsLines, clusterPatternMatch,
        patterns, clusterKey, portal
    ) {
    // For each cluster grouping, create a tile. For each cluster in the grouping,
    // create a subcluster tile with that subcluster's information in it.
    return html`
        ${subclusters.map(cluster => {
            // For each tile in the grouping, get the required information
            // and make checkboxes and info buttons.
            let name = cluster["keywords"].join(", "),
                identifier = cluster[clusterKey],
                pattern = patterns[clusterPatternMatch[identifier]],
                clusterButton = new Button(
                    toggleClusterVisibility(clusterUnits, clusterKey),
                    {
                        label: "Show Pattern",
                        hoverText: "Display this cluster's pattern on the map.",
                        optionalID: identifier,
                        buttonClassName: "cluster-tile__button cluster-tile__button-toggle",
                        labelClassName: "cluster-tile__component cluster-tile__label"
                    }
                ),
                infoButton = new Button(
                    onSupportingDataClicked(cluster, portal), {
                        label: "Supporting Data",
                        buttonClassName: "cluster-tile__button",
                        labelClassName: "cluster-tile__component cluster-tile__label",
                        hoverText: "Opens a new tab with this cluster's supporting data."
                    }
                ),
                highlightButton = new Button(
                    toggleClusterBorderVisibility(clusterUnitsLines, cluster[clusterKey], clusterKey), {
                        label: "Show Border",
                        optionalID: cluster[clusterKey],
                        buttonClassName: "cluster-tile__button cluster-tile__highlight",
                        labelClassName: "cluster-tile__component cluster-tile__label cluster-tile__highlight-label",
                        hoverText: "Shows the border of this cluster in bright red."
                    }
                );

            return html`
                <div class="cluster-tile__subcluster">
                    <div class="cluster-tile__button-container">
                        <div
                            class="cluster-tile__pattern"
                            style="background-image: url('${pattern}');"
                        ></div>

                        ${clusterButton}
                        ${highlightButton}
                        ${infoButton}
                    </div>
                    <div class="cluster-tile__subcluster-keywords">
                        <i>C${identifier} – ${name}</i>
                    </div>
                </div>
            `;
        })}
    `;
}

/**
 * @description Navigates to the next (or previous) cluster.
 * @param {Boolean} direction Which direction we're going; `false` is backwards, `true` forwards.
 * @param {Layer} clusterUnits districtr Layer object.
 * @param {Layer} clusterUnitsLines districtr Layer object for cluster borders.
 * @param {String} clusterKey Cluster unique identifier.
 * @returns {Function} Function to make things visible/invisible.
 */
function goToNextCluster(direction, clusterUnits, clusterUnitsLines, clusterKey) {
    return (_) => {
            // Get the list of statuses; this is only to retrieve the cluster IDs
            // in the order they're rendered.
        let statuses = getCheckboxButtonStatuses(),
            highlightButtons = retrieveHighlightButtons(),
            order = statuses.map((s) => s["cluster"]),

            // Get the first visible cluster or the first cluster in the list of
            // clusters; this is our "current" cluster. Then, get its index in
            // the list of things and calculate the next index we'll be traveling
            // to.
            visible = statuses.filter((s) => s["checked"]),
            current = visible.length ? visible[0] : statuses[statuses.length-1],

            // Adjusting the index is a bit odd: going forward, we can just mod;
            // going backward, mod doesn't work properly (rude, honestly) so we
            // have to use another ternary expression.
            activeIndex = order.indexOf(current["cluster"]),
            nextIndex = direction ?
                (activeIndex+1)%statuses.length :                       // moving forward
                (activeIndex-1 < 0 ? order.length-1 : (activeIndex-1)), // moving backward

            // Get the current and next buttons, as well as the necessary
            // identifiers.
            activePatternButton = statuses[activeIndex]["entity"],
            nextPatternButton = statuses[nextIndex]["entity"],
            activeHighlightButton = highlightButtons[activeIndex],
            nextHighlightButton = highlightButtons[nextIndex],
            invisible = order.filter((id) => id.toString() !== nextPatternButton["id"].toString()),
            
            // Set some styles.
            opacity = getCurrentOpacity();

        // Restyle buttons.
        togglePatternButtonStyles(activePatternButton, false);
        toggleHighlightButtonStyles(activeHighlightButton, false);
        togglePatternButtonStyles(nextPatternButton, true);
        toggleHighlightButtonStyles(nextHighlightButton, true);

        // Make things visible/invisible.
        opacityStyleExpression(clusterUnits, invisible, clusterKey, opacity);
        borderStyleExpression(clusterUnitsLines, nextPatternButton["id"], clusterKey);
    };
}

/**
 * @description Creates the set of user controls.
 * @param {Layer} clusterUnits districtr Layer corresponding to clusters.
 * @param {Layer} clusterUnitsLines districtr Layer corresponding to cluster borders.
 * @param {String} clusterKey Unique identifier for clusters.
 * @returns 
 */
function createControls(clusterUnits, clusterUnitsLines, clusterKey) {
    let layerToggle = toggleClusterLayerVisibility(clusterUnits, clusterUnitsLines, clusterKey),
        showNextButton = new Button(
            goToNextCluster(true, clusterUnits, clusterUnitsLines, clusterKey), {
                label: "Show Next ↓ ",
                optionalID: nextButtonClass,
                buttonClassName: "cluster-control__button",
                hoverText: "Switch focus to the next cluster in the list."
            }
        ),
        uncheckAllButton = new Button(
            makeAllInvisible(clusterUnits, clusterUnitsLines, clusterKey),
            {
                label: "Clear",
                optionalID: uncheckAllButtonClass,
                buttonClassName: "cluster-control__button",
                sideEffect: hideAllBorders(clusterUnitsLines, clusterKey),
                hoverText: "Hide all clusters and cluster borders."
            }
        ),
        showPreviousButton = new Button(
           goToNextCluster(false, clusterUnits, clusterUnitsLines, clusterKey), {
                label: " ↑ Show Previous",
                optionalID: previousButtonClass,
                buttonClassName: "cluster-control__button",
                hoverText: "Switch focus to the previous cluster in the list."
            }
        );

    return () => html`
        <div class="toolbar-section cluster-control cluster-control__component">
            ${createLayerToggleCheckbox(layerToggle)}
            ${createOpacitySlider()}
            <div class="cluster-control__component cluster-control__subcomponent">
                ${showPreviousButton}
                ${uncheckAllButton}
                ${showNextButton}
            </div>
        </div>
    `;
}

/**
 * @description Creates a pattern intensity slider.
 * @returns {Function} Callback with an HTMLTemplateElement.
 */
function createOpacitySlider() {
    return html`
        <div class="cluster-control__component ${sliderControlClass}">
            <label class="cluster-control__component" for="pattern-intensity-slider">
                Pattern Intensity
            </label>
            <input
                class="cluster-control__component" id="pattern-intensity-slider"
                type="range" value="75" max="100" min="0"
            >
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
 * @description Sets the initial state of all the checkboxes.
 * @returns {undefined}
 */
function setInitialCheckboxButtonState() {
    let buttons = retrieveCheckboxButtons();

    for (let button of buttons) {
        button.checked = false;
    }
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

        abilities = spatial_abilities(place.id),
        shouldDisplay = abilities.coi,
        portal = abilities.portal.endpoint;

    // If we shouldn't display COIs, just return nothing.
    if (!shouldDisplay) return;
    
    // Add COIs to the state.
    addCOIs(state)
        .then(object => {
                // Destructure the object sent to us from addCOIs.
            let {
                    clusters, clusterPatternMatch, clusterUnits, clusterUnitsLines,
                    patterns, clusterKey
                } = object,
                map = clusterUnits.map,
                clusterLayer = clusterUnits.sourceLayer,

                // Get display callbacks and stuff.
                tooltipCallback = watchTooltips(clusters, clusterKey),
                initialOpacity = 0,
                tooltipWatcher;

            // Assign each cluster's geometry to a pattern.
            clusterPatternStyleExpression(clusterUnits, clusterPatternMatch, clusterKey);
            map.setLayoutProperty(clusterLayer, "visibility", "none");
            clusterUnits.setOpacity(initialOpacity);

            // Add the section for the display checkbox and the intensity.
            tab.addSection(createControls(clusterUnits, clusterUnitsLines, clusterKey));

            // Create arrays of subclusters to properly create the cluster tiles.
            let section;

            // For each cluster group, add a specially styled section to the
            // tab.
            for (let cluster of clusters) {
                    section = clusterSection(
                        cluster, clusterUnits, clusterUnitsLines,
                        clusterPatternMatch, patterns, clusterKey, portal
                    );
                
                // Add a section just containing the cluster toggle.
                tab.addSection(section);
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();

            // Once things have been rendered, add an event handler for the
            // opacity slider.
            handleOpacitySlider(clusterUnits, clusterKey);

            // Initially style the checkboxes and create tooltips.
            initiallyStyleCheckboxButtons(clusterPatternMatch, patterns);
            setInitialCheckboxButtonState();
            tooltipWatcher = new Tooltip(clusterUnits, tooltipCallback, 0);
            tooltipWatcher.activate();
        });
}

export default CoiVisualizationPlugin;
