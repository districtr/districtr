import { directive } from "lit-html";

/**
 * Creates an HTML entity which provides some supplementary information about
 * the dataset being used to balance population.
 * @param {State} state A State object.
 * @returns {String} The description for the dataset used.
 */
function datasetInfo(state) {
    // Dictionary of descriptions.
    let population = state.population,
        units = state.unitsRecord,
        place = state.place,
        populations = {
            census: "This plan's population statistics are drawn from the " +
                "<strong>2010 United States Census</strong>. Most states require the use of " +
                "data from the most recent decennial Census in their redistricting " +
                "processes. Constitutionally mandated to be conducted every ten " +
                "years, this dataset is extremely broad, with more than 18,000 " +
                "data points collected across varying levels of geography. This " +
                "data is available at the <strong>Census block </strong> level, " +
                "and has been aggregated from the block level to " +
                place.name + "'s " + units.unitType + ".",
            acs: "This plan's population statistics are drawn from the " +
                "<strong>2019 American Community Survey five-year estimates</strong>. " +
                "This dataset is produced by the United States Census Bureau, " +
                "which samples approximately 3.5 million households and uses " +
                "statistical methods to extrapolate findings from that sample " +
                "– as well as existing data – to a nationwide dataset similar to " +
                "the Census. The ACS is not as granular as the Census, and is " +
                "available at the Census block group level. " +
                (units.unitType.toLowerCase() !== "block groups" ? "Because " +
                    "this plan's base units are not Census block groups, the data " +
                    "attached have undergone a dis- and re-aggregation process: by " +
                    "breaking the data down into smaller geographic parts, we can " +
                    "fit those smaller parts together to build " + place.name + "'s "
                    + units.unitType + ". " : "")
        };
    
    if (place.id.toLowerCase() === "wisco2019acs" || population.name !== "Population") {
        return `<p><span>&#9432;</span> ${populations.acs}</p>`;
    }
    return `<p><span>&#9432;</span> ${populations.census}</p>`;
}

/**
 * Wrapper function which returns an immediately-callable directive which
 * populates the dataset-info sections in a nice way.
 * @param {State} state State object.
 * @returns {function(*): void}
 */
export default function populateDatasetInfo(state) {
    return directive(promise => () => {
        Promise.resolve(promise).then(() => {
            // Retrieve the proper HTML elements.
            let elements = document.getElementsByClassName("dataset-info"),
                infoBoxes = Array.from(elements);
            
            // For each of the info boxes, retrieve and add the correct
            // description.
            infoBoxes.forEach(box => {
                box.innerHTML = datasetInfo(state);
            });
        });
    })();
}
