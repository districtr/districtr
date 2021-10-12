
import { spatial_abilities } from "../utils";
import { unitBordersPaintProperty } from "../colors";

/**
 * @description Fetches a JSON file which maps pattern names to filepaths. Needed
 * for assigning COIs to patterns.
 * @returns {Promise} Promise which gets the locally-defined patterns.
 */
function loadPatternMapping() {
    return fetch("/assets/patterns/patterns.json").then(res => res.json());
}

/**
 * @description Loads the desired patterns.
 * @param {mapboxgl.Map} map Map object to which we're adding patterns.
 * @param {Object} patternMapping Maps pattern names to URLs.
 * @returns Promise When each of the Promises in the provided iterable have
 * resovled or rejected, returns an array of pattern names (or "transparent" if
 * the Promise couldn't be resolved).
 */
function loadPatterns(map, patternMapping) {
    // Create an array which we'll fill with Promises.
    let patternLoadingPromises = [];

    // For each pattern and its corresponding URL, attempt to load the image
    // into mapbox. Once the image is loaded, return the name of the pattern to
    // the caller as a Promise.
    for (let [pattern, url] of Object.entries(patternMapping)) {
        patternLoadingPromises.push(
            new Promise((resolve, reject) => {
                map.loadImage(url, (error, image) => {
                    // If we encounter an error, the pattern won't load. Even though
                    // this violates a linting rule -- because we aren't rejecting
                    // with an error -- that's the point: any pattern whose image
                    // can't be loaded should become transparent.
                    if (error) reject("transparent");

                    // Otherwise, add the pattern to the map, and it's ready for
                    // assignment!
                    map.addImage(pattern, image);
                    resolve(pattern);
                });
            })
        );
    }

    return Promise.allSettled(patternLoadingPromises);
}

/**
 * @description Maps cluster names to pattern names so we can easily reference later.
 * @param {unitMap} unitMap Maps cluster names to COI names to units.
 * @param {Object} patterns Patterns we've chosen.
 * @returns Object Takes COI names to pattern names.
 */
 function patternsToClusters(clusters, patterns, clusterKey) {
    let numClusters = 0;
        for (let cluster of clusters) numClusters += cluster["subclusters"].length;

    let mapping = {},
        interval = 5,
        numIntervals = Math.ceil(numClusters/interval),
        patternSlice = patterns.slice(0, interval),
        repeatedPatterns = [];

    // Generate a list of repeated patterns with interval width `interval`.
    for (let _=0; _ < numIntervals; _++) {
        repeatedPatterns = repeatedPatterns.concat(patternSlice);
    }

    for (let cluster of clusters) {
        // If the cluster has multiple subclusters, then we assign the same
        // pattern to the clusters.
        for (let subcluster of cluster["subclusters"]) {
            let subclusterIdentifier = subcluster[clusterKey];
            mapping[subclusterIdentifier] = repeatedPatterns.shift();
        }
    }

    return mapping;
}

/**
 * @description Takes the results from Promise.allSettled() and makes them into
 * an array that's easier to handle.
 * @param {Object[]} results Resolved or rejected Promise results.
 * @returns Object[]
 */
function resolvesToArray(results) {
    let values = [];
    for (let result of results) values.push(result.value);
    return Promise.resolve(values);
}

/**
 * @description Sets (or unsets) the border of a given unit.
 * @param {Layer} units districtr Layer object.
 * @param {String[]} identifiers Identifier of unit whose border we're making visible.
 * @param {String} id Mapbox column containing the unique IDs in `identifiers`.
 * @param {String} color Color to which the border is set.
 * @returns {undefined}
 */
export function borderStyleExpression(units, identifier, id="GEOID20", color="#FF0000") {
    // Create a filter for setting colors, widths, and opacities of the specified
    // units.
    let defaultLineWidth = 0,
        defaultLineOpacity = unitBordersPaintProperty["line-opacity"],
        subfilter = [
            "case", [
                "==",
                ["get", id],
                ["literal", identifier]
            ]
        ],
        colorFilter = subfilter.concat(
            [color, "transparent"]
        ),
        widthFilter = subfilter.concat(
            [4, defaultLineWidth]
        ),
        opacityFilter = subfilter.concat(
            [0.8, defaultLineOpacity]
        );

    units.setPaintProperty("line-color", colorFilter);
    units.setPaintProperty("line-width", widthFilter);
    units.setPaintProperty("line-opacity", opacityFilter);
}

/**
 * @description Modifies the opacities of the units in the layer.
 * @param {Layer} units districtr Layer object.
 * @param {String[]} identifiers Array of unit identifiers to make invisi ble.
 * @param {String} id Mapbox column containing the unique IDs in `identifiers`.
 * @param {Number} opacity Opacity level; defaults to 75%.
 * @returns {undefined}
 */
export function opacityStyleExpression(units, identifiers, id="GEOID20", opacity=3/4) {
    // Create a filter for setting opacities on only the specified units.
    let filter = [
            "case", [
                "in",
                ["get", id],
                ["literal", identifiers]
            ],
            0, opacity
        ],
        layer = units.type.replace("symbol", "icon") + "-opacity";
    units.setPaintProperty(layer, filter);
}

/**
 * @description Sets pattern fill properties on specified units.
 * @param {Layer} units districtr Layer object on which we're setting patterns.
 * @param {Object} clusterPatternMatch Maps cluster names to patterns.
 * @param {String} id Unique ID column on geometries in `units`.
 * @return {undefined}
 */
export function clusterPatternStyleExpression(units, clusterPatternMatch, id="GEOID20") {
    let expression = ["case"];

    // Assign a pattern to each cluster.
    for (let label of Object.keys(clusterPatternMatch)) {
        let subexpression = [
            "in",
            ["get", id],
            ["literal", label]
        ];

        expression.push(subexpression, clusterPatternMatch[label]);
    }
    
    // Make the remaining units transparent and enforce the style rule.
    expression.push("transparent");
    units.setPaintProperty("fill-pattern", expression);
}

/**
 * @description Retrieves the appropriate URL to get cluster resources.
 * @param {Object} coi districtr-interpretable COI object as specified in utils.js.
 * @returns {String} URL at which the cluster resources are located.
 */
export function retrieveCOIs(coi) {
    let URL = coi.clusterData.url;

    return URL;
}

/**
 * @description Configures COI-related functionality in districting mode.
 * @param {State} state Holds state for the application.
 * @param {Tab} tab Tab object we're adding items to.
 * @returns {Promise} Promise which resolves to the necessary objects for visualizing COIs.
 */
export function addCOIs(state) {
    let { map, clusterUnits, clusterUnitsLines, place } = state,
        coi = spatial_abilities(place.id).coi,
        URL = retrieveCOIs(coi);

    // Fetch COI data from the provided URL. Note that in order to return the
    // required data to the caller, we have to return *all* the Promises and
    // their resolutions, not just the first or last ones. This is important, as
    // we don't want to have to recalculate COI-related stuff later.
    return fetch(URL)
        .then(res => res.json())
        .then(clusters => {
            return loadPatternMapping().then(patterns => {
                let clusterPatterns = Array.from(Object.keys(patterns));

                // Now, get the right number of names, pare down the object mapping
                // names to URLs to only contain the desired names, and map COIs
                // to patterns.
                let clusterPatternMatch = patternsToClusters(clusters, clusterPatterns, coi.clusterKey);
                
                // Now, we want to load each of the patterns and assign them to
                // expressions.
                return loadPatterns(map, patterns)
                    .then(loadedPatterns => resolvesToArray(loadedPatterns))
                    .then((_) => ({
                            clusters: clusters,
                            clusterPatternMatch: clusterPatternMatch,
                            clusterUnits: clusterUnits,
                            clusterUnitsLines: clusterUnitsLines,
                            patterns: patterns,
                            clusterKey: coi.clusterKey
                        })
                    );
            });
        });
}
