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
            census: "Uses <strong>2010 Decennial Census</strong> data",
            census20: "Uses <strong>2020 Decennial Census</strong> data",
            acs: "Uses <strong>2019 American Community Survey</strong> data",
            mesa: "Uses <strong>2019 American Community Survey</strong> population disaggregated from blockgroups by Redistricting Partners",
            mesa2020: "Uses <strong>2020 Decennial Census</strong> population with processing by Redistricting Partners",
            pasorobles: "Uses <strong>2019 American Community Survey</strong> population disaggregated from blockgroups by Cooperative Strategies",
            sacramento: "Uses <strong>projected 2020 population</strong> based on the American Community Survey by National Demographics Corporation"
        },
        acsLocations = [
            "wisco2019acs", "hall_ga", "grand_county_2", "mn2020acs", "nd_benson",
            "nd_dunn", "nd_mckenzie", "nd_mountrail", "nd_ramsey", "nd_rollette",
            "nd_sioux", "contracosta"
        ],
        units = state.unitsRecord.name,
        dataset = "";

    if (acsLocations.includes(place.id.toLowerCase()) || state.units.id.includes("2019") || population.name !== "Population") {
        dataset = `<p><span>&#9432;</span> ${populations.acs}`;
    } else if (["rp_lax", "ca_butte", "mesaaz", "sanluiso", "sanjoseca", "siskiyou", "redwood", "ca_ventura", "ca_yolo", "ca_solano", "ca_sc_county", "ca_sanmateo", "ca_kern", "ca_sanjoaquin", "ca_sc_county", "ca_tuolumne", "napa2021", "napacounty2021", "napa_boe", "santa_clara_h2o", "ca_oakland", "ca_martinez", "ca_humboldt", "carpinteria"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${(units === "2020 Blocks") ? populations.mesa2020 : populations.mesa}`;
    } else if (["pasorobles"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.pasorobles}`;
    } else if (["sacramento", "ca_sonoma", "ca_pasadena", "ca_goleta", "ca_santabarbara", "ca_marin", "ca_kings", "ca_merced", "ca_fresno", "ca_nevada", "ca_marina", "ca_arroyo", "ca_sm_county", "ca_sanbenito", "ca_cvista", "ca_bellflower", "ca_camarillo", "ca_fresno_ci", "ca_fremont", "lake_el", "ca_chino", "ca_campbell", "ca_vallejo", "ca_oceano", "ca_grover", "ca_buellton", "buenapark", "ca_stockton", "halfmoon", "ca_carlsbad", "ca_richmond", "elcajon", "laverne", "encinitas", "lodi", "pomona", "sunnyvale"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.sacramento}`;
    } else if (["2020 Block Groups", "2020 Blocks", "2020 Precincts", "2020 VTDs", "2020 Counties"].includes(state.unitsRecord.name)) {
        dataset = `<p><span>&#9432;</span> ${populations.census20}`;
    } else dataset = `<p><span>&#9432;</span> ${populations.census}`;

    return dataset + ` on <strong>${units}</strong>.</p>`;
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
