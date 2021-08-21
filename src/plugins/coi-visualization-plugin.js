
import { Tab } from "../components/Tab";
import { addCOIs, styleExpression } from "../layers/COI";
import { html, directive, render } from "lit-html";
import { toggle } from "../components/Toggle";


/**
 * @description Handles turning COI viz on and off.
 * @param {Object} object Object containing relevant COI info.
 * @returns {Function} Callback for Toggle.
 */
function displayCOIs(object) {
    // Destructure the COI object we get from addCOIs.
    let { cois, unitMap, patternMatch, units } = object;
    return (checked) => { units.setOpacity(checked ? 1/2 : 0); };
}

/**
 * @description Adjusts the width of the tool pane to accommodate wider stuff.
 * @returns {Function} lit-html directive which adjusts the width of the tool pane.
 */
function adjustToolpaneWidth() {
    // Currently does nothing, but this will be used to modify the width of the
    // tool pane.
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
                "Display Communities of Interest",
                false,
                callback
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
 * @param {Objewt} patternMatch The original mapping from COI names to patterns; used to reset.
 * @returns {HTMLTemplateElement} A lit-html template element.
 */
function listCOIs(cluster, units, unitMap, activePatternMatch, patternMatch) {
    return html`
        <div class="toolbar-section">
            ${
                // Here, we map over each part of the cluster -- where each
                // part is a COI -- and create a checkbox for each one.
                cluster.plan.parts.map((coi) => {
                    let individualCOIDisplayToggle = toggle(
                        coi.name,
                        true,
                        toggleIndividualCOI(
                            coi.name, units, unitMap, activePatternMatch,
                            patternMatch
                        )
                    );

                    return html`
                        <div class="toolbar-inner">
                            ${individualCOIDisplayToggle}
                        </div>
                    `;
                })
            }
        </div>
    `;
}

/**
 * @description Creates a toggle for an individual COI within a cluster.
 * @param {String} name Name of the individual COI.
 * @param {Object} units A mapbox thing that I can't quite assign a type to.
 * @param {Object} unitMap Maps COI names to units within the cluster.
 * @param {Object} activePatternMatch The active mapping from COI names to patterns.
 * @param {Objewt} patternMatch The original mapping from COI names to patterns; used to reset.
 * @returns {Function} Callback for the toggle.
 */
function toggleIndividualCOI(name, units, unitMap, activePatternMatch, patternMatch) {
    return (checked) => {
        // First, modify the pattern matcher so that the entry in the active
        // pattern match (the one shared by all toggles) is consistent with the
        // checked/unchecked status of the checkbox. Then, create the style
        // expression for the entire set of units to turn on/off the units for
        // an individual COI. TODO: make this a little faster, because right now
        // it resets ALL the units, not just the ones we need to reset.
        activePatternMatch[name] = checked ? patternMatch[name] : "transparent";
        styleExpression(units, unitMap, activePatternMatch);
    }
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
            // First, create a a display callback for 
            let displayCallback = displayCOIs(object),
                { clusters, unitMap, patternMatch, units } = object,
                activePatternMatch = JSON.parse(JSON.stringify(patternMatch));

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
                    clusterToggle = toggle(
                        name, true,
                        checked => {console.log(name)}
                    );

                // Add a reveal section with a toggle for a label.
                tab.addSection(
                    () => html`
                        <div class="toolbar-section">
                            <h4>${clusterToggle}</h4>
                            ${listCOIs(cluster, units, unitMap, activePatternMatch, patternMatch)}
                        </div>
                    `
                );
            }

            // Add the tab to the tool pane and force a render.
            toolbar.addTab(tab);
            editor.render();
        });
}

export default CoiVisualizationPlugin;
