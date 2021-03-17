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
            census: "Uses <strong>2010 Decennial Census</strong> data.",
            acs: "Uses <strong>2019 American Community Survey</strong> data."
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
