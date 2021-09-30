
import Filter from "bad-words";
import Tooltip from "../map/Tooltip";
import { spatial_abilities } from "../utils";
const wordfilter = new Filter();

/**
 * @description For each of the clusters and their comprising COIs, get the units they cover.
 * @param {Object[]} clusters List of clusters, defined as Plans.
 * @returns Object COIs and the units they cover; a Set containing unique COI names.
 */
function createUnitMap(clusters) {
    let unitMap = {};
    
    // Create a mapping from cluster IDs to a mapping which takes individual COI
    // names to the units the COI covers, as well as *all* the units the COI
    // covers. I really wish there was a better way to selectively do opacity
    // stuff on things rather than having to re-write the whole fucking style
    // expression -- that's really annoying.
    for (let [label, cluster] of Object.entries(clusters)) {
        let clusterIdentifier = label,
            identifiers = {},
            clusterMap = {};

        // Get the names of the clusters so we can re-name later.
        for (let part of cluster.plan.parts) identifiers[part.id] = part.name;

        // For each of the COIs in the cluster, map the *identifier* of the COI
        // to the units it covers. This populates the `clusterMap` object, which
        // we'll be modifying in a moment.
        for (let [unit, coiids] of Object.entries(cluster.plan.assignment)) {
            // Sometimes -- when units belong only to one COI -- the COI identifiers
            // are reported only as integers and *not* lists of integers. Here,
            // we just force them to be lists of numbers.
            if (!Array.isArray(coiids)) coiids = [coiids];

            for (let coiid of coiids) {
                let name = identifiers[coiid];
                if (clusterMap[name]) clusterMap[name].push(unit);
                else clusterMap[name] = [unit];
            }
        }

        unitMap[clusterIdentifier] = clusterMap;
    }

    // Return the summed object and the unique names accompanying it.
    return unitMap;
}

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
 * @description Maps COI names to pattern names so we can easily reference later.
 * @param {unitMap} unitMap Maps cluster names to COI names to units.
 * @param {Object} patterns Patterns we've chosen.
 * @returns Object Takes COI names to pattern names.
 */
function patternsToCOIs(unitMap, patterns) {
    let mapping = {};

    for (let [clusterIdentifier, cluster] of Object.entries(unitMap)) {
        // Create an empty mapping for the *cluster* into which we can assign
        // patterns for the individual COIs. Then, for each of the individual
        // COIs, assign to it the first pattern in the list of patterns.
        mapping[clusterIdentifier] = {};

        for (let coiIdentifier of Object.keys(cluster)) {
            mapping[clusterIdentifier][coiIdentifier] = patterns.shift();
        }
    }
    return mapping;
}

/**
 * @description Maps cluster names to pattern names so we can easily reference later.
 * @param {unitMap} unitMap Maps cluster names to COI names to units.
 * @param {Object} patterns Patterns we've chosen.
 * @returns Object Takes COI names to pattern names.
 */
 function patternsToClusters(clusters, patterns, clusterKey) {
    let mapping = {};

    for (let cluster of clusters) {
        // Create an empty mapping for the *cluster* into which we can assign
        // patterns for the individual COIs. Then, for each of the individual
        // COIs, assign to it the first pattern in the list of patterns.
        let clusterIdentifier = cluster[clusterKey];
        mapping[clusterIdentifier] = patterns.shift();
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

export function opacityStyleExpression(units, geoids, id="GEOID20", opacity=1/2) {
    // Create a filter for setting opacities on only the specified units.
    let filter = [
            "case", [
                "in",
                ["get", id],
                ["literal", geoids]
            ],
            0, opacity
        ],
        layer = units.type.replace("symbol", "icon") + "-opacity";
    units.setPaintProperty(layer, filter);
}

/**
 * @description Creates a style expression for the units.
 * @param {Object} units Units we're coloring.
 * @param {Object} unitMap Unit mapping.
 * @param {Object} coiPatternMatch Pattern mapping; just unitMapping, but instead of units, it's pattern names.
 * @returns {Array[]} Array of expressions.
 */
export function coiPatternStyleExpression(units, unitMap, coiPatternMatch, id="GEOID20") {
    let expression = ["case"];

    // For each of the clusters and the COIs within that cluster, assign each
    // COI a pattern according 
    for (let [clusterIdentifier, cluster] of Object.entries(unitMap)) {
        for (let [coiName, geoids] of Object.entries(cluster)) {
            let subexpression = [
                "in",
                ["get", id],
                ["literal", geoids]
            ];
            expression.push(subexpression, coiPatternMatch[clusterIdentifier][coiName]);
        }
    }

    // Make the remaining units transparent and enforce the style rule.
    expression.push("transparent");
    units.setPaintProperty("fill-pattern", expression);

    return expression;
}

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
    let { map, clusterUnits, place } = state,
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
                    .then(_ => {
                        // From here, we want to return all the necessary items
                        // for properly rendering the COIs in the tool pane. We
                        // should return the style expression, the unit mapping,
                        // the pattern mapping, and the COIs themselves.
                        return {
                            clusters: clusters,
                            clusterPatternMatch: clusterPatternMatch,
                            clusterUnits: clusterUnits,
                            patterns: patterns,
                            clusterKey: coi.clusterKey
                        };
                    });
            });
        });
}
