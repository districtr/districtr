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
            census20adj: "Uses <strong>2020 Decennial Census</strong> prison-adjusted data",
            census20adjMT: "Uses prison-adjusted <strong>2020 Decennial Census</strong> data",
            census20non_p_adj: "Uses <strong>2020 Decennial Census</strong> adjusted data",
            acs: "Uses <strong>2019 American Community Survey</strong> data",
            mesa: "Uses <strong>2019 American Community Survey</strong> population disaggregated from blockgroups by Redistricting Partners",
            redistpartners2020: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by Redistricting Partners",
            modesto: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by Redistricting Partners",
            ndc_prison_2020: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by National Demographics Corporation",
            pasorobles: "Uses <strong>2019 American Community Survey</strong> population disaggregated from blockgroups by Cooperative Strategies",
            sacramento: "Uses <strong>projected 2020 population</strong> data with processing by National Demographics Corporation",
            ndc_proj_2020: "Uses <strong>projected 2020 population</strong> data with processing by National Demographics Corporation",
            ndc_2020: "Uses <strong>2020 Decennial Census population</strong> with processing by National Demographics Corporation",
            wagaman_2020: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by Wagaman Strategies",
            cooperative_strategies: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by Cooperative Strategies",
            ca_elkgrove: "Uses <strong>adjusted 2020 Decennial Census population</strong> with processing by the City of Elk Grove",
            az_pima: "Uses <strong>2020 Decennial Census population</strong> with processing by Pima County",
            az_maricopa: "Uses <strong>2020 Decennial Census population</strong> with processing by Maricopa County Recorder’s Office",
            haystaq_2020: "Uses <strong>2020 Decennial Census population</strong> with processing by Haystaq",
            research_polling: "Uses <strong>2020 Decennial Census population</strong> with processing by Research & Polling",
            nyc_2022: "Uses <strong>2020 Decennial Census</strong> population with processing by Redistricting Partners"
        },
        acsLocations = [
            "wisco2019acs", "hall_ga", "grand_county_2", "mn2020acs", "nd_benson",
            "nd_dunn", "nd_mckenzie", "nd_mountrail", "nd_ramsey", "nd_rollette",
            "nd_sioux", "contracosta"
        ],
        units = state.unitsRecord.name,
        dataset = "";

    console.dir(state);

    if (acsLocations.includes(place.id.toLowerCase()) || state.units.id.includes("2019") || population.name !== "Population") {
        dataset = `<p><span>&#9432;</span> ${populations.acs}`;
    } else if (["mt_pris_adj"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.census20adjMT}`;
    } else if ("nyc_popdemo" === place.id) {
        dataset = `<p><span>&#9432;</span> ${populations.nyc_2022}`;
    } else if (
        [
            "rp_lax", "ca_butte", "sanluiso", "sanjoseca", "siskiyou", "redwood",
            "ca_ventura", "ca_yolo", "ca_solano", "ca_sc_county", "ca_sanmateo",
            "ca_kern", "ca_sanjoaquin", "ca_sc_county", "ca_tuolumne", "napa2021",
            "napacounty2021", "napa_boe", "santa_clara_h2o", "ca_oakland",
            "ca_martinez", "ca_humboldt", "carpinteria", "modesto", "santarosa",
            "ca_millbrae", "ca_belmont", "ca_scvosa", "ca_west_sac", "ca_diamond_bar", "ca_riverside"
        ].includes(place.id)
    ) {
        dataset = `<p><span>&#9432;</span> ${(units === "2020 Blocks") ? populations.redistpartners2020 : populations.mesa}`;
    } else if (["pasorobles"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.pasorobles}`;
    } else if (["ca_elkgrove"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.ca_elkgrove}`;
    } else if (["az_pima"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.az_pima}`;
    } else if (["az_maricopa"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.az_maricopa}`;
    } else if (["ca_fpud"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.haystaq_2020}`;
    } else if (["nm_abq"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.research_polling}`;

    // Cooperative strategies modules. I also wholeheartedly disagree with the
    // way this info message differentiation is being done; why don't we put this
    // info in the *configuration* for these modules rather than doing it
    // after-the-fact and making it way harder to figure out? This is ridiculous
    // and certainly not the way it was intended to be written.
    } else if (["sbusd_5", "sbusd_7", "pvsd"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.cooperative_strategies}`;
    } else if (["ca_watsonville", "ca_rohnert", "ca_brentwood"].includes(place.id)) {
        dataset = `<p><span>&#9432;</span> ${populations.wagaman_2020}`;
    } else if (
        [
            "sacramento", "ca_goleta", "ca_santabarbara", "ca_marin", "ca_kings",
            "ca_merced", "ca_nevada", "ca_marina", "ca_arroyo", "ca_sm_county",
            "ca_sanbenito", "ca_bellflower", "ca_camarillo", "ca_fremont", "lake_el",
            "ca_chino", "ca_campbell", "ca_vallejo", "ca_oceano", "ca_grover",
            "ca_buellton", "buenapark", "halfmoon", "ca_carlsbad", "ca_richmond",
            "elcajon", "laverne", "encinitas", "lodi", "pomona", "sunnyvale"
        ].includes(place.id)
        &&
        ![
            "2020 Block Groups", "2020 Blocks", "2020 Precincts", "2020 VTDs",
            "2020 Counties"
        ].includes(state.unitsRecord.name)
    ) {
        dataset = `<p><span>&#9432;</span> ${populations.ndc_proj_2020}`;
    } else if (["2020 Block Groups", "2020 Blocks", "2020 Precincts", "2020 VTDs", "2020 Counties", "2021 Precincts", "2022 Precincts"].includes(state.unitsRecord.name)) {
        if (("2020 VTDs" === state.unitsRecord.name && ["virginia", "maryland", "pa_prison_adj"].includes(place.id)) ||
            (
                [
                    "california", "ca_SanDiego", "ca_contracosta", "ca_sutter",
                    "menlo_park", "marinco"
                ].includes(state.place.id)
            )
        ) {
            dataset = `<p><span>&#9432;</span> ${populations.census20adj}`;
        } else if (["pa_adj"].includes(place.id)) {
            dataset = `<p><span>&#9432;</span> ${populations.census20non_p_adj}`;
        } else if (
                [
                    "san_dimas", "ccsanitation2", "ca_pasadena", "sacramento",
                    "ca_goleta", "ca_glendora", "arcadia", "la_mirada", "lakewood",
                    "san_bruno", "ca_santabarbara", "ca_marin", "ca_kings",
                    "ca_merced", "ca_fresno", "ca_sm_county", "ca_sanbenito", "laverne",
                    "29palms", "yuba_city", "buenapark", "ca_arroyo", "ca_camarillo",
                    "ca_chino", "ca_grover", "ca_nevada", "elcajon", "pomona",
                    "ca_fremont", "encinitas", "oxnarduhsd", "ca_carlsbad",
                    "ca_buellton", "ca_oceano"
                ].includes(state.place.id)
            ) {
          // 2020 - NDC - Prison
          dataset = `<p><span>&#9432;</span> ${populations.ndc_prison_2020}`;
        } else if (
            [
                "placentia", "anaheim", "ca_fresno_ci", "ca_cvista", "ca_stockton",
                "ca_sonoma", "ca_poway", "ca_torrance", "navajoco", "buena_park"
            ].includes(state.place.id)) {
            // 2020 NDC un-adjusted population.
            dataset = `<p><span>&#9432;</span> ${populations.ndc_2020}`;
        } else {
          // 2020 generic
          dataset = `<p><span>&#9432;</span> ${populations.census20}`;
        }
    } else {
        dataset = `<p><span>&#9432;</span> ${populations.census}`;
    }

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
