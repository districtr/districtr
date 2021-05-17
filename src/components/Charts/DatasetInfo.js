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
        place = state.place,
        populations = {
            census: "Uses <strong>2010 Decennial Census</strong> data.",
            acs: "Uses <strong>2019 American Community Survey</strong> data.",
            mesa: "Uses <strong>2019 American Community Survey</strong> population disaggregated from blockgroups by Redistricting Partners.",
        },
        acsLocations = ["wisco2019acs", "grand_county_2", "mn2020acs"];
    if (acsLocations.includes(place.id.toLowerCase()) || state.units.id.includes("2019") || population.name !== "Population") {
        return `<p><span>&#9432;</span> ${populations.acs}</p>`;
    } else if (["mesaaz"].includes(place.id)) {
        return `<p><span>&#9432;</span> ${populations.mesa}</p>`;
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
