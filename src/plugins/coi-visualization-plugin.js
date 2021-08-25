import Tooltip from "../map/Tooltip";
import { Tab } from "../components/Tab";
import { addCOIs, opacityStyleExpression, patternStyleExpression } from "../layers/COI";
import { html, directive } from "lit-html";
import { toggle } from "../components/Toggle";

/**
 * @description Extends the native Set type with an intersection function.
 * @param {Set} B The set we're intersecting with.
 * @returns {Set} The intersection of the two sets.
 */
function _intersection(B) {
    let intersection = new Set();
    for (let e of B) if (this.has(e)) intersection.add(e);
    return intersection;
}

Set.prototype.intersection = _intersection;

/**
 * @description Watches tooltips
 * @param {*} units 
 * @param {*} clusters 
 * @param {*} unitsMap 
 * @param {*} activePatternMatch 
 * @param {*} identifier 
 * @returns 
 */
function watchTooltips(units, clusters, unitsMap, activePatternMatch, identifier="GEOID20") {
    let reverseMapping = {};

    // Create a mapping which takes individual units to the clusters and COIs to
    // which they belong. This lets us look up any individual unit and see where
    // its membership lies, and we only have to create it once and it hangs out
    // in memory.
    for (let [clusterIdentifier, cluster] of Object.entries(unitsMap)) {
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

    return (features) => {
        // If we have no units we don't have to do anything!
        if (features.length === 0) return null;

        // Otherwise, we obtain the feature we want, get its GEOID, and check
        // whether it's visible.
        let feature = features[0],
            geoid = feature.properties[identifier];

        // Now, we want to check that the unit we're hovering over belongs to the
        // set of units in the COIs. If it does, we want to create a tooltip.
        if (reverseMapping[geoid]) {
            // For the current feature, get the cluster identifier and the COI(s)
            // to which it belongs. We also retrieve three categories of
            // checkbox: the checkbox which controls displaying *all* the COIs;
            // the checkbox which controls the display of the *cluster* of COIs;
            // the checkbox which controls the display of the *current* COIs.
            // Then, we iterate over these checkboxes and if *any* of them are
            // unchecked, we don't display the tooltip.
            let cluster = reverseMapping[geoid]["cluster"],
                cois = reverseMapping[geoid]["coi"],
                coiClasses = cois.map((coi) => coi.replaceAll(" ", "-")),
                checkboxes = []
                    .concat(Array.from(document.getElementsByClassName("allvisible-checkbox")))
                    .concat(Array.from(document.getElementsByClassName(cluster))),
                isChecked = true,
                filtered = [];

            for (let coi of coiClasses) checkboxes.concat(Array.from(document.getElementsByClassName(coi)));

            // Filter the checkboxes.
            for (let checkbox of checkboxes) {
                if (checkbox.localName == "label") filtered = filtered.concat([checkbox]);
            }

            // If *any* of the checkboxes are unchecked, we can't view the things.
            // We also skip over any checkboxes whose COI names aren't included
            // in the list of COIs we're not displaying; this way, when users
            // mouse over the COIs, invisible ones don't show up.
            for (let checkbox of filtered) {
                let coi = checkbox.classList[3];
                if (checkbox.classList.length > 3 && !coiClasses.includes(coi)) continue;
                isChecked = isChecked && checkbox.control.checked;
            }

            if (isChecked) {
                return html`
                    <div class="tooltip__text__small tooltip__text--column">
                        ${
                            reverseMapping[geoid]["coi"].map(
                                (d) => html`<div style="text-align: center;">${d}</div>`
                            )
                        }
                    </div>
                `;
            } else return null;
        } else return null;
    };
}

/**
 * @description Initially style the checkboxes; this is modified when COIs are displayed.
 */
function initialStyles(patternMatch, patternURLs) {
    let allCheckboxes = []
            .concat(Array.from(document.getElementsByClassName("coi-checkbox")))
            .concat(Array.from(document.getElementsByClassName("cluster-checkbox"))),
        justCOIBoxes = Array.from(document.getElementsByClassName("coi-checkbox"));

    // Style all of the checkboxes according to the initial style rules, and
    // set the background images to their patterns.
    for (let checkbox of allCheckboxes) {
        checkbox.style["pointer-events"] = "none";
        checkbox.style["opacity"] = 1/2;
    }

    /*
    // Now, assign backgrounds to each of the COI checkboxes according to their
    // pattern assignments. This is a little rickety in the event we add more
    // CSS class designations to the 
    for (let checkbox of justCOIBoxes) {
        let clusterName = checkbox.classList[2],
            coiName = Array.from(checkbox.classList)
                .slice(3, checkbox.classList.length)
                .join(" "),
            pattern = patternMatch[clusterName][coiName],
            url = chosenPatterns[pattern];

        checkbox.style["background-image"] = `url(${url})`;
    }
    */
}

/**
 * @description Handles turning COI viz on and off.
 * @param {Object} units Layer we're adjusting.
 * @returns {Function} Callback for Toggle.
 */
function displayCOIs(units) {
    // Destructure the COI object we get from addCOIs and find all the active
    // checkboxes to disable them.
    let allCheckboxes = [];

    return (checked) => {
        allCheckboxes = allCheckboxes
            .concat(Array.from(document.getElementsByClassName("coi-checkbox")))
            .concat(Array.from(document.getElementsByClassName("cluster-checkbox")));
        
        // Disable all the checkboxes and style them accordingly.
        for (let checkbox of allCheckboxes) {
            checkbox.style["pointer-events"] = checked ? "auto" : "none";
            checkbox.style["opacity"] = checked ? 1 : 1/2;
            units.setOpacity(checked ? 1/3 : 0);
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
 * @descriptions Creates a renderable HTML entity for the COIs within a cluster.
 * @param {Object} cluster A cluster of COIs.
 * @param {Object} units A mapbox thing that I can't quite assign a type to.
 * @param {Object} unitMap Maps COI names to units within the cluster.
 * @param {Object} activePatternMatch The active mapping from COI names to patterns.
 * @param {Object} patternMatch The original mapping from COI names to patterns.
 * @returns {HTMLTemplateElement} A lit-html template element.
 */
function listCOIs(cluster, units, unitMap, activePatternMatch, patternMatch, chosenPatterns) {
    return html`
        <div class="toolbar-section-left cluster-display">
            ${
                // Here, we map over each part of the cluster -- where each
                // part is a COI -- and create a checkbox for each one. We add
                // the cluster ID and the COI name as classes to each of the
                // toggles so we can selectively en/disable them when toggling
                // further up in the hierarchy. Also get the background image
                // for 
                cluster.plan.parts.map((coi) => {
                    let adjustedClassName = coi.name.replaceAll(" ", "-"),
                        _individualCOIDisplayToggle = toggle(
                            coi.name, true,
                            toggleIndividualCOI(
                                cluster.plan.id, coi.name, units, unitMap,
                                activePatternMatch, patternMatch
                            ),
                            null,
                            `coi-checkbox ${cluster.plan.id} ${adjustedClassName}`
                        ),
                        imageURL = chosenPatterns[
                            patternMatch[cluster.plan.id][coi.name]
                        ],
                        styles = `
                            background-image: url('${imageURL}');
                            height: 1em;
                            width: 3em;
                            display: block;
                            opacity: 0.6;
                            border-radius: 5px;
                        `,
                        individualCOIDisplayToggle = html`
                            <div style="display: flex; flex-direction: row; align-items: center;">
                                ${_individualCOIDisplayToggle}
                                <span style="${styles}"></span>
                            </div>
                        `;
                    
                    // Style the inner `div`s according to the same rules.
                    return html`
                        <div class="toolbar-section-left">
                            ${individualCOIDisplayToggle}
                            <p style='padding-top: 0.25rem' class='${cluster.plan.id} ${coi.name}'>${coi.description}</p>
                        </div>
                    `;
                })
            }
        </div>
    `;
}

/**
 * @description Creates a toggle for an individual COI within a cluster.
 * @param {String} cluster Name of the cluster to which the COI belongs.
 * @param {String} name Name of the individual COI.
 * @param {Object} units A mapbox thing that I can't quite assign a type to.
 * @param {Object} unitMap Maps COI names to units within the cluster.
 * @param {Object} activePatternMatch The active mapping from COI names to patterns.
 * @param {Object} patternMatch The original mapping from COI names to patterns; used to reset.
 * @returns {Function} Callback for the toggle.
 */
function toggleIndividualCOI(cluster, name, units, unitMap, activePatternMatch, patternMatch) {
    return (checked) => {
        activePatternMatch[cluster][name] = checked ? patternMatch[cluster][name] : "transparent";
        patternStyleExpression(units, unitMap, activePatternMatch);
    };
}

/**
 * @description Creates a toggle for an entire cluster of COIs.
 * @param {String} cluster Name of the cluster we're disabling.
 * @param {Object} units A mapbox thing that I can't quite assign a type to.
 * @param {Object} unitMap Maps COI names to units within the cluster.
 * @param {Object} activePatternMatch The active mapping from COI names to patterns.
 * @param {Object} patternMatch The original mapping from COI names to patterns; used to reset.
 * @returns {Function} Callback for the toggle.
 */
function toggleCluster(cluster, units, unitMap, activePatternMatch, patternMatch) {
    return (checked) => {
        // TODO: not sure how to do this yet. Probably going to do it tomorrow.
        // The question here is this: does this toggle function the same way as the
        // top button, where it just "turns off the opacity" and then maintains the
        // checked/unchecked state of the COIs (i.e. disabling the checkboxes for the
        // COIs it comprises) when they're checked back on; or, does un-checking the
        // cluster checkbox just uncheck all the toggles below it, and then you have
        // to re-check all of them later? I think it should be the former.

        // Get the geoids for the units we're turning off.
        let geoids = [],
            clusterCheckboxes = Array.from(document.getElementsByClassName(cluster)),
            filtered = [];

        // Filter the checkboxes.
        for (let checkbox of clusterCheckboxes) {
            if (checkbox.classList.length > 3) filtered = filtered.concat([checkbox]);
        }

        for (let [name, ids] of Object.entries(unitMap[cluster])) {
            activePatternMatch[cluster][name] = checked ? patternMatch[cluster][name] : "transparent";
            geoids = geoids.concat(ids);
        }

        // Disallow interaction with the checkboxes for each of the COIs belonging
        // to this cluster.
        for (let checkbox of filtered) {
            checkbox.style["pointer-events"] = checked ? "auto" : "none";
            checkbox.style["opacity"] = checked ? 1 : 1/2;
        }

        // Do the style expression thing.
        patternStyleExpression(units, unitMap, activePatternMatch);
        // opacityStyleExpression(units, geoids, checked);
    };
}

function tooltips() {
    // TODO: make some tooltips for each of the COIs.
}

/**
 * @description Creates a tab on the toolbar for checking out COIs.
 * @param {Editor} editor Districtr internal Editor object.
 * @returns {undefined}
 */
function CoiVisualizationPlugin(editor) {
    let { state, toolbar, store } = editor,
        tab = new Tab("coi", "Communities", store);
    
    addCOIs(state, null)
        .then(object => {
            // First, create a a display callback for displaying COIs, retrieve
            // each of the necessary data-carrying things from the object returned
            // by the call to `addCOIs`, and create a *copy* of the pattern map.
            // We make a deep copy, so the copy -- which holds the state of
            // activated/deactivated COIs -- can be modified without losing the
            // original pattern assignments for the COIs.
            let { clusters, unitMap, patternMatch, units, chosenPatterns } = object,
                displayCallback = displayCOIs(units),
                activePatternMatch = JSON.parse(JSON.stringify(patternMatch)),
                tooltipCallback = watchTooltips(units, clusters, unitMap, activePatternMatch),
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
                let name = cluster.plan.id,
                    clusterToggle = toggle(
                        name, true,
                        toggleCluster(name, units, unitMap, activePatternMatch, patternMatch),
                        null, `cluster-checkbox ${name}`
                    );

                // Add a section with a toggle for a label.
                tab.addSection(
                    () => html`
                        <div class="toolbar-section-left">
                            <h4>${clusterToggle}</h4>
                            ${
                                listCOIs(
                                    cluster, units, unitMap, activePatternMatch,
                                    patternMatch, chosenPatterns
                                )
                            }
                        </div>
                    `
                );
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();

            // Initially style the checkboxes and create tooltips.
            initialStyles(patternMatch, chosenPatterns);
            tooltipWatcher = new Tooltip(units, tooltipCallback, 0);
            tooltipWatcher.activate();
        });
}

export default CoiVisualizationPlugin;
