
import { html, render } from "lit-html";
import DisplayPane from "../components/DisplayPane";
import {
    loadPlanFromURL,
    navigateTo,
    getContextFromStorage
} from "../routes";
import { MapState } from "../map";
import State from "../models/State";
import populateDatasetInfo from "../components/Charts/DatasetInfo";
import { getCell, getCellSeatShare, parseElectionName } from "../components/Charts/PartisanSummary";
import { getPartyRGBColors } from "../layers/color-rules"
import { DataTable } from "../components/Charts/DataTable"
import { interpolateBlues, interpolateReds } from "d3-scale-chromatic";
import { roundToDecimal, county_fips_to_name, spatial_abilities, stateNameToFips, COUNTIES_TILESET } from "../utils";
import { districtColors } from "../colors";
import Layer, { addBelowLabels } from "../map/Layer";
import { toggle } from "../components/Toggle";
import Analyzer from "../models/Analyzer";

// global for the election slides
let two_party = -1;
// global for tracking if we have made the counties layer
let counties = false;

/**
 * @desc Retrieves the proper map style; uses the same rules as the Editor.
 * @param {Object} context Context object retrieved from the database.
 * @returns {string} Proper map formatting style.
 */
function getMapStyle(context) {
    return "mapbox://styles/mapbox/light-v10";
}

/**
 * @desc Renders the provided plan in the correct Pane.
 * @param {String} container HTML id tag for the Map's container element.
 * @param {object} context Plan context object as retrieved from the database.
 * @returns {undefined}
 */
function renderMap(container, context) {
    // Create a MapState object from the context retrieved from the database and
    // provide it with the correct arguments to render.
    const mapState = new MapState(
        "map",
        {
            bounds: context.units.bounds,
            fitBoundsOptions: {
                padding: {
                    top: 50,
                    right: 50,
                    left: 50,
                    bottom: 50
                }
            },
            dragPan: true
        },
        getMapStyle(context)
    );
    
    // Set a callback for when the map has loaded from the database
    let state;
    mapState.map.on("load", () => {
        state = new State(
            mapState.map,
            null,
            context,
            () => {}
        );
        
        if (context.assignment) 
            state.plan.assignment = context.assignment;
        state.units.map.dragPan.enable();
        state.render();
        renderRight(new DisplayPane({ id: "analysis-right" }), context, state, mapState);
    });
}

/**
 * @desc Renders the left Pane to the desired content; in this case, that's the
 * map.
 * @param {DisplayPane} pane The DisplayPane om the left.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderLeft(pane, context) {
    // Set the inner HTML of the Pane.
    pane.inner = html`
        <div class="mapcontainer">
            <div id="map" class="map"></div>
        </div>
    `;

    // Render the template to the Pane, render the Map, and close the
    // Modal.
    pane.render();
    renderMap("map", context);
}

/**
 * @desc Renders the right Pane
 * @param {DisplayPane} pane The DisplayPane on the right.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderRight(pane, context, state, mapState) {
    const units = state.unitsRecord.id;
    const stateName = state.place.state;
    let assign = Object.fromEntries(Object.entries(state.plan.assignment).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    let two_party_elects = state.elections.filter(e => e.subgroups.every(c => ['d', 'r'].includes(c.name.toLowerCase()[0])));
    let elections = two_party_elects.map(e => {
                                            let elect = [["name", e.name], 
                                                        ["candidates", e.subgroups.map(c => {
                                                            let candidates = [["name", c.name],["key", c.key]];
                                                            return Object.fromEntries(candidates);})]]
                                            return Object.fromEntries(elect);
                                        });
    const GERRYCHAIN_URL = "https://gvd4917837.execute-api.us-east-1.amazonaws.com";
    fetch(GERRYCHAIN_URL + "/evaluation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "state": stateName,
        "units": units,
        "assignment": assign,
        "elections": elections}),
    })
    .then((res) => res.json())
    .catch((e) => console.error(e))
    .then((data) => {
            console.log(data);
            if (data.error) {
                render(html`Analysis unavailable for ${state.place.state} 
                        on ${state.unitsRecord.unitType.toLowerCase()}.<br/>
                        Error text: ${data.error}.`, 
                    document.getElementById('analysis-right'));
                return;
            }
            let municipalities = ['ma'].includes(state.place.id);

            let innerTemplate = document.createElement("div");
            innerTemplate.className = "analysis--inner";
            innerTemplate.id = "analysis-area"
            innerTemplate.innerHTML = "Loading."
            pane.pane.append(innerTemplate);

            let analyzer = new Analyzer(state, mapState, innerTemplate);
            analyzer.addRevealSection("Basics", (uiState, dispatch) => overview_section(state, data.contiguity, data.split, data.num_units))
            analyzer.addRevealSection("Election Results and Partisanship", (uiState, dispatch) => election_section(state, data.partisanship))
            analyzer.addRevealSection("Compactness", (uiState, dispatch) => compactness_section(state, data.cut_edges, data.polsbypopper))
            data.counties == -1 ? "" : 
                analyzer.addRevealSection(municipalities ? "Municipality Splits" : "County Splits", 
                    (uiState, dispatch) => county_section(state, data.counties, municipalities))
            analyzer.render();
        });
}

/** FUNCTIONS FOR LOADING THE PAGE */
function getPlanURLFromQueryParam() {
    if (window.location.search.includes("url=")) {
        return window.location.search.split("url=")[1].split('&')[0].split("#")[0];
    } else {
        return "";
    }
}

function getPlanContext() {
    const planURL = getPlanURLFromQueryParam();
    let finalURLpage = window.location.pathname.split("/").slice(-1)[0];
    if (planURL.length > 0) {
        return loadPlanFromURL(planURL).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan from ${planURL}`);
            navigateTo("/evaluation");
            // eslint-disable-next-line no-console
            console.error(e);
        });
    } else if (!["edit", "coi", "plan", "eval"].includes(finalURLpage.toLowerCase())) {
        // remove token; save a new plan
        localStorage.removeItem("districtr_token_" + finalURLpage);
        // load JSON plan from DB
        if (isNaN(finalURLpage * 1)) {
            // original _id plans
            finalURLpage = '&_id=' + finalURLpage;
        }
        return loadPlanFromURL(`/.netlify/functions/planRead?id=${finalURLpage}`).catch(e => {
            console.error(`Could not load plan ${finalURLpage} from database`);
            navigateTo("/evaluation");
            console.error(e);
        });
    } else {
        return Promise.resolve(getContextFromStorage());
    }
}

/**
 * @desc Renders the Analysis view.
 * @returns {undefined}
 */
export default function renderAnalysisView() {
    // Create left display pane.    
    // hold on creating the right one, bc we need the mapstate first
    let left = new DisplayPane({ id: "analysis-left" });
    getPlanContext().then((context) => renderLeft(left, context));
}

// Functions for formating a non-election table.
function getBackgroundColor(value, party) {
    // console.log(party);
    // console.log(value);
    let buffer = 0.001;
    let p = party.toLowerCase()[0];

    if ((p === "d" && value > 0 + buffer) || (p === 'r' && value < 0 - buffer)) {
        return interpolateBlues(Math.abs(value));
    }
    if ((p === "r" && value > 0 + buffer) || (p === 'd' && value < 0 - buffer)) {
        return interpolateReds(Math.abs(value));
    }
    return "#f9f9f9";
}

function getCellStyle(value, party) {
    const background = getBackgroundColor(value, party);
    const color = Math.abs(value) > 0.8 ? "white" : "black";
    return `background: ${background}; color: ${color}`;
}

function getCellBasic(value, decimals, party, simple=false) {
    // const value = subgroup.values(part.id)
    return {
        content: `${roundToDecimal(value * 100, decimals ? 1 : 0)}%`,
        style: (simple ? `color: black` : getCellStyle(value, party)) + `; text-align: center;`
    };
}

/***** ANALYSIS SECTIONS ******/
// Overview Section
function overview_section (state, contig, problems, num_tiles) {
    const planURL = getPlanURLFromQueryParam();
    let finalURLpage = window.location.pathname.split("/").slice(-1)[0];
    let edit_url = planURL.length > 0 ? "/edit?url=" + planURL : "/edit/" + finalURLpage;
    // plan details
    let drawn = state.population.total.data.map(x => x > 0 ? 1 : 0)
        .reduce((a,b) => a + b, 0),
        dist_num = state.plan.problem.numberOfParts;
    let details = html`<div>
        ${state.unitsRecord.unitType.toLowerCase() === "vtds" ? html`(VTDs, also called “voting
        tabulation districts” or “voting districts,” are the closest approximation of electoral
        precincts in Census geography.)<br/>` : null}
        The plan type is ${state.plan.problem.pluralNoun} for ${state.place.name} (${dist_num} districts).
        `

    // missing units
    let missing = num_tiles - Object.keys(state.plan.assignment).length;
    let unassigned_section = 
        html`
        ${dist_num == drawn ? "All" : ""} ${drawn} districts are present.<br/>
        ${missing == 0 ? "All" : ""} ${Object.keys(state.plan.assignment).length} / ${num_tiles}
        ${state.unitsRecord.unitType} are assigned to a district.<br/>
        ${missing == 0 ? html`This plan is <strong>complete</strong>.`
                       : html`This plan is <strong>incomplete</strong>.  Be sure all districts are
                            present and all units are assigned to complete the plan –
                            <a href="${edit_url}" target="_blank">open in Districtr</a> to continue editing.`}
        `

    // contiguity
    let contig_section = 
        (problems)
        ? html`
            A plan is called contiguous if every district is internally connected.
            This plan appears to be ${contig ? html`<strong>contiguous</strong>.` 
                : html`<strong>discontiguous</strong>.<br/>
                The following districts may have contiguity gaps:
                
                <div class="district-row" style="display:block">
                    ${state.parts.map((part, dnum) => {
                    return html`
                        <span
                            class="part-number"
                            style="background:${districtColors[dnum % districtColors.length].hex};
                            display:${problems.includes(dnum)
                                ? "inline-flex"
                                : "none"}"
                        >
                            ${Number(dnum) + 1}
                        </span>`})}</div>`}
            Note that contiguity can be subtle because of bodies of water and because of
            disconnected units.  <a href="${edit_url}" target="_blank">Open in Districtr</a> to examine the contiguity gaps.
            `
        : html`Contiguity status not available for ${state.place.name}.`
    
    // population deviation
    let deviations = state.population.deviations();
    let min = deviations[0], max = deviations[0], argmin = 0, argmax = 0;
    for (let d = 1; d < deviations.length; d++) {
        if (deviations[d] < min) {
            min = deviations[d];
            argmin = d;
        }
        if (deviations[d] > max) {
            max = deviations[d];
            argmax = d;
        }
    }
    let pop_section = html`<div style="text-align:left">
    The ideal size of a district is arrived at by dividing the total population of the state equally
    into the specified number of districts. Population deviation of a plan is measured as the
    largest amount that any district differs from ideal size. Legislative plans should typically have
    individual deviations under ± 5%, which ensures a top-to-bottom deviation of under 10%.
    Congressional plans are typically more tightly balanced.<br/>
    Your plan's most populous district is district  
    <span
        class="part-number"
        style="background:${districtColors[argmax % districtColors.length].hex};
        display:inline-flex"
    >
        ${Number(argmax) + 1}
    </span> (+${roundToDecimal(max * 100, 2)}%) and your plan's least populous district is district  
    <span
        class="part-number"
        style="background:${districtColors[argmin % districtColors.length].hex};
        display:inline-flex"
    >
    ${Number(argmin) + 1}
    </span> (${roundToDecimal(min * 100, 2)}%).<br/>`
    
    // aggregate all the parts
    return html`
    <h4 text-align="center">Data, Units, and Plan Type</h4>
    <div class="dataset-info">
        ${populateDatasetInfo(state)}
    </div>
    ${details}<br/>
    <h4 text-align="center">Completeness</h4>
    ${unassigned_section}<br/><br/>
    <h4 text-align="center">Contiguity</h4>
    ${contig_section}<br/><br/>
    <h4 text-align="center">Population Deviation</h4>
    ${pop_section}</div>`;
}

// Election Results Section
function election_section(state, partisanship) {
    // let elections = state.elections;
    let elections = state.elections.filter(e => e.subgroups.every(c => ['d', 'r'].includes(c.name.toLowerCase()[0])));
    let num_districts = state.plan.parts.length;
    if (state.elections.length < 1)
        return html`No election data available for ${state.place.name}.`
    let rows = [];

    // filters to only two parties, but only sets the global once
    // two_party = two_party == -1 ? elections.map(e => e.subgroups.length == 2).reduce((a,b) => a + b, 0) == elections.length : two_party;
    // elections.forEach(e => e.subgroups = e.subgroups.length == 1 ? e.subgroups : e.subgroups.filter(p => ['Democratic', 'Republican'].includes(p.name)));
    
    let headers = ['Election'].concat(
        elections[0].parties.reduce((acc, party) => {
            const rgb = getPartyRGBColors(party.name + party.key);
            return acc.concat([html`<div style="color: rgb(${rgb[0]},${rgb[1]},${rgb[2]})">${party.name.substring(0,3)} Votes</div>`,
                    html`<div style="color: rgb(${rgb[0]},${rgb[1]},${rgb[2]})">${party.name.substring(0,3)} Seats</div>`])
        }, [])).concat([html`<div>Dispro-portionality</div>`]);

    let bias_acc = []
    const width = `${Math.round(81 / headers.length)}%`;
    for (let election of elections) {
        let d_votes = election.parties[0].getOverallFraction(),
            d_seats = election.getSeatsWonParty(election.parties[0]);
        let d_seat_share = d_seats/election.total.data.length;
        let bias_to = (Math.abs(d_votes - d_seat_share)*num_districts < 0.5) ? "N" : (d_votes > d_seat_share) ? "R" : "D";


        // > 0 if biased towards Rs, < 0 if toward Ds
        let bias_by = Math.round(((d_votes - d_seat_share) * election.total.data.length) * 10)/10;
        bias_acc.push(bias_by);
        
        let disportionality = Math.abs(bias_by) / (2*num_districts);
        let biases = [
            (bias_to == "N") ? {content: `As proportional as possible`, 
                                style: `background: #f9f9f9 ; width: ${width};`}
                             : (bias_to == "R") ? {content: `Leans Republican by ${Math.abs(bias_by)} seats`,
                                                   style: `background: ${interpolateReds(disportionality)}; width: ${width};`}
                                                : {content: `Leans Democrat by ${Math.abs(bias_by)} seats`,
                                                   style: `background: ${interpolateBlues(disportionality)}; width: ${width};`}
        ]

        rows.push({
            label: parseElectionName(election.name),
            entries: election.parties.reduce((acc, party) => acc.concat([getCell(party, null), 
                                                                         getCellSeatShare(party, election)]),
                                             []).concat(biases)
        });
    }
    let favor = bias_acc.map(x => x > 0 ? 1 : -1).reduce((a,b) => a + b, 0);
    let favorstr = "";
    switch (favor) {
        case elections.length: favorstr = html`favors <strong>Republicans</strong> in every election`
        break;
        case -elections.length: favorstr = html`favors <strong>Democrats</strong> in every election`
        break;
        default: favorstr = "favored different parties in different elections";
    }
    let avg_bias = roundToDecimal(bias_acc.reduce((a,b) => a + b, 0)/bias_acc.length, 1);
    
    let score_headers = ['Election', "Efficiency Gap", "Mean Median", "Partisan Bias", "Eguia's Metric"];
    let dec = true;
    let score_rows = Object.entries(partisanship.election_scores).map(([name, stats]) => {
        return {
            label: parseElectionName(name),
            entries: [getCellBasic(stats.efficiency_gap, dec, partisanship.party),
                      getCellBasic(stats.mean_median, dec, partisanship.party), 
                      getCellBasic(stats.partisan_bias, dec, partisanship.party),
                      getCellBasic(stats.eguia_county, dec, partisanship.party)]
        }
    });
    
    // console.log(score_rows);
    let num_elects = Object.keys(partisanship.election_scores).length;
    return html`
        Our current dataset contains <strong>${bias_acc.length} recent statewide 
        ${elections.length > 1 ? html`elections` : html`election`}</strong> for ${state.place.name}.
        <br/>
        <br/>
        <h4 text-align="center">Proportionality</h4>
        Relative to proportionality, your plan has an average lean of ${Math.abs(avg_bias)} seats towards 
        <strong>${(avg_bias > 0) ? html`Republicans` : html`Democrats`}</strong> over these elections.<br/>
        The disproportionality ${favorstr}.
        <br/>
        <br/>
        <strong>Votes vs. Seats by Election (among the two major parties)</strong>
        ${DataTable(headers, rows, true)}
        <br/>
        <h4 text-align="center">Other Partisanship Metrics</h4>
        The following scores can all be found in the political science literature, but are not
        necessarily endorsed by leading scholars at this time. They are included here for completeness.<br/>
        In this case, the point-of-view party is the <strong>${partisanship.party}</strong> party,
        so positive scores are thought to show a pro-${partisanship.party} lean. <br/><br/>
        ${DataTable(score_headers, score_rows, true)}
        <br/>
        <br/>
        <h4 text-align="center">Competitiveness Metrics</h4>
        A “swing district” is one that has been won by each major party at least once over the
        elections in this dataset.
        Your plan has ${partisanship.plan_scores.num_party_districts} districts that always go
        ${partisanship.party}, ${partisanship.plan_scores.num_op_party_districts} districts that
        always go ${partisanship.party.toLowerCase()[0] === 'd' ? "Republican" : "Democratic"}, and
        <strong>${partisanship.plan_scores.num_swing_districts} swing districts</strong>
        (out of ${num_districts} districts).  
        <br/>
        <br/>
        A “competitive district” is one where each party has 47% – 53% of the major-party vote in a
        district. Your plan had <strong>${partisanship.plan_scores.num_competitive_districts} districts</strong>
        within this competitive margin, out of a possible total of 
        (${num_districts} districts * ${num_elects} elections) = ${num_districts*num_elects}.
        `;
}

// Compactness Section (cut edges, polsby popper)
function compactness_section(state, cut_edges, plan_scores) {
    // Polsby Popper Scores
    let columns = ["Max", "Min", "Mean"]
    let rows = [], headers, comparison;
    let enacted = polsby_popper(state.place.name, state.plan.problem.name);
    
    // check that polsby popper calculation worked
    let successful_calc = (plan_scores !== "Polsby Popper unavailable for this geometry.");
    let year = enacted_year(state_name_to_postal(state.place.name), state.plan.problem.name);
    if (successful_calc) {
        headers = ["Your Plan"];
        for (let c of columns) {
            rows.push({
                label: c,
                entries: [
                    {content: roundToDecimal(plan_scores[c.toLowerCase()], 3)},
            ]})
        }
    }
    let polsbypopper_table = successful_calc ? DataTable(headers, rows) : plan_scores;
    return html`
        <h4>Cut Edges</h4>
        <div style='text-align: left'>
        One measurement of compactness is the number of <strong>cut edges</strong> in a districting plan. 
        This counts the number of adjacent units that are separated into different 
        districts in the plan - you can think of this as the "scissors complexity," 
        or how much work you'd need to do to cut out the plan. You should only compare 
        the cut edges count when you're looking at two plans for the same state using the 
        same units. Then, a lower number of cut edges means a plan is more compact.<br/><br/>
        ${cut_edges > 0 ?
        html`Your plan has <strong>${cut_edges}</strong> cut edges between ${state.unitsRecord.unitType}.`
        : html`Cut Edges count not available for ${state.place.name}.`}
        </div>
        <br/>        
        <h4>Polsby Popper Scores</h4>
        <div style='text-align: left'>
        A classic measurement of compactness is the <strong>Polsby Popper score</strong>, which 
        is a comparison of the area of a district to its perimeter. Instead of being sensitive to
        the choice of units, like cut edges, this depends on mapping choices like the map projection
        and the resolution of the boundaries. A higher Polsby Popper score is regarded as signaling
        a more compact district; the highest possible score of an individual district is 1, which is
        only achieved by perfect circles.
        ${polsbypopper_table}
        `;
}

// County Splits Section
function county_section(state, data, municipalities) {
    let pnoun = municipalities ? "municipalities" : "counties",
        noun = municipalities ? "municipality" : "county";

    // need population info on the python anywhere dual graph for this
    let forced = {};
    if (data.population != -1) {
        Object.keys(data.population).map(x => 
            forced[x] = Math.ceil(data.population[x]/state.population.ideal)
        );
    }
    // get number of splits to be forced
    let c_forced = Object.values(forced).reduce((a,b) => b > 1 ? a + 1 : a, 0);
    let num_split = Object.keys(data.split_list).length;

    // county button
    const COUNTIES_LAYER = {
        id: "counties",
        source: COUNTIES_TILESET.sourceLayer,
        "source-layer": COUNTIES_TILESET.sourceLayer,
        type: "line",
        paint: {
            "line-color": "#444444",
            "line-width": [
                "interpolate",
                ["linear"],
                ["zoom"],
                0,
                0,
                4,
                1,
                6,
                2,
                9,
                3
            ],
            "line-opacity": ["interpolate", ["linear"], ["zoom"], 0, 0.4, 9, 0.5]
        }
    };

    let statecode = String(stateNameToFips[(state.place.state || state.place.id).toLowerCase().replace("2020", "").replace("_bg", "")]);
    counties = counties ? counties : new Layer(
        state.map,
        {
            ...COUNTIES_LAYER,
            paint: { ...COUNTIES_LAYER.paint, "line-opacity": 0 },
            filter: [
                "==",
                ["get", "STATEFP"],
                statecode
            ]
        },
        addBelowLabels
    );
    
    let alt_counties = {
        alaska: 'Borough',
        alaska_blocks: 'Borough',
        louisiana: 'Parish',
    }[state.place.id];
    let county_toggle = html`
            ${toggle(`Show ${alt_counties || "County"} Boundaries`, false, checked =>
                counties.setOpacity(
                    checked ? COUNTIES_LAYER.paint["fill-opacity"] : 0
                ))}`
    const c_forced_in_2 = Object.values(forced).reduce((a,b) => b === 2 ? a + 1 : a, 0);
    const c_forced_in_3more = Object.values(forced).reduce((a,b) => b > 2 ? a + 1 : a, 0);
    const c_in_2 = Object.values(data.split_list).reduce((a,b) => b.length === 2 ? a + 1 : a, 0);
    const c_in_3more = Object.values(data.split_list).reduce((a,b) => b.length > 2 ? a + 1 : a, 0);
    
    const plural_singular = (num) => num === 1 ? html`1 ${noun}` : html`${num} ${pnoun}`;
    const plural_singular_tobe = (num) => num === 1 ? html`1 ${noun} is` : html`${num} ${pnoun} are`;
    
    let text = (data.population == -1) 
    ? html`<div style="text-align:left">
    ${state.place.name} has ${data.num_counties} ${pnoun}
    Your plan splits ${plural_singular(num_split)} a total of ${data.splits} times.<br/>
    The split ${pnoun} are:
    <ul>
    ${Object.keys(data.split_list).map(x => {
        if (isNaN(x))
            return html`<li>${x}</li>`
        return html`<li>${county_fips_to_name(x, state.place.state) + " County"}</li>`
    })}
    </ul>
    <div>`
    : html`<div style="text-align:left">
    ${state.place.name} has ${data.num_counties} ${pnoun}. 
    Your plan splits <strong>${plural_singular(num_split)}</strong>. ${plural_singular_tobe(c_in_2)}
    split in two pieces and ${plural_singular_tobe(c_in_3more)} split into three or more pieces.
    <br/>
    (The number of pieces is the same as counting the number of districts touched by the county)
    <br/><br/>
    The population in ${c_forced} of ${state.place.name}'s ${pnoun} is larger than a district,
    sometimes several times larger.
    ${num_split > 0 ? html`
        In total, population size forces ${plural_singular(c_forced_in_2)} to be split in two and
        ${plural_singular(c_forced_in_3more)} to be split into three or more pieces.`
        : ""}
    <br/>`
    
    // if the dual graph on python anywhere doesn't have population
    if (data.population == -1)
        return html`${county_toggle}<br/>${text}`;

    // build the table
    let noun_cap = municipalities ? "Municipality" : "County";
    let headers = [noun_cap, "# Pieces", "Minimium Possible"],
        rows = [];
    for (let c of Object.keys(data.split_list)) {
        let c_name = isNaN(c) ? c : (county_fips_to_name(c, state.place.state) + " County");
        rows.push({
            label: c_name,
            entries: [
                {content: data.split_list[c].length},
                {content: forced[c]}
            ]
        })
    }
    return html`${county_toggle}<br/>${text}<br/>
    ${num_split > 0 ? html`
        <h4 text-align:"center">${noun_cap} Split Details</h4>
        ${DataTable(headers, rows, true)}` : ""}`
}

/** HELPER FUNCTIONS */
function enacted_year(st, districts) {
    if (['Congress', '2020 Reapportioned Congress'].includes(districts)) {
        switch (st) {
            case "AL": return 2011
            break;
            case "FL": return 2015
            break;
            case "NC": return 2019
            break;
            case "OH": return 2011
            break;
            case "PA": return 2018
            break;
            case "TX": return 2012
            break;
            default: return 2011;
        }
    }
    if (districts == 'State Senate') {
        switch(st) {
            case "AK": return 2013
            break;
            case "AL": return 2017
            break;
            case "CO": return 2011
            break;
            case "FL": return 2016
            break;
            case "GA": return 2014
            break;
            case "HI": return 2012
            break;
            case "ID": return 2012
            break;
            case "KY": return 2013
            break;
            case "ME": return 2013
            break;
            case "MO": return 2012
            break;
            case "MS": return 2019
            break;
            case "MT": return 2013
            break;
            case "NC": return 2019
            break;
            case "PA": return 2013
            break;
            case "TX": return 2012
            break;
            case "UT": return 2012
            break;
            default: return 2011;
        }
    }
    if (['State House', 'State Assembly', 'House of Delegates'].includes(districts)) {
        switch(st) {
            case "AK": return 2013
            break;
            case "AL": return 2017
            break;
            case "CO": return 2011
            break;
            case "GA": return 2015
            break;
            case "HI": return 2012
            break;
            case "ID": return 2012
            break;
            case "KY": return 2013
            break;
            case "ME": return 2013
            break;
            case "MS": return 2012
            break;
            case "MT": return 2013
            break;
            case "NC": return 2019
            break;
            case "PA": return 2013
            break;
            case "TX": return 2019
            break;
            case "UT": return 2012
            break;
            case "WI": return  2012
            break;
            default: return 2011;
        }
    }
    return 2011;
}

function polsby_popper(st, districts) {
    let cong = {
        VA:
        {
            max: 0.2609509200948297,
            min: 0.0935015846140669,
            mean: 0.18651696516748836,
            median: 0.1948014784812254,
            variance: 0.002460600533279498
        },
        PR:
        {
            max: 0.27323828085164537,
            min: 0.27323828085164537,
            mean: 0.27323828085164537,
            median: 0.27323828085164537
        },
        KS:
        {
            max: 0.4585198982749231,
            min: 0.35004283329114144,
            mean: 0.4089909022368307,
            median: 0.4137004386906291,
            variance: 0.0020620628469314845
        },
        WY:
        {
            max: 0.7721781271591052,
            min: 0.7721781271591052,
            mean: 0.7721781271591052,
            median: 0.7721781271591052
        },
        NY:
        {
            max: 0.547787715674496,
            min: 0.09349445555308791,
            mean: 0.3475999679668771,
            median: 0.34443556759851945,
            variance: 0.014624682301184501
        },
        WA:
        {
            max: 0.48324460273265046,
            min: 0.15791099570671835,
            mean: 0.2785398067689706,
            median: 0.24077651188256238,
            variance: 0.009943169002222425
        },
        HI:
        {
            max: 0.39384502078112726,
            min: 0.06527518778297405,
            mean: 0.22956010428205065,
            median: 0.22956010428205065,
            variance: 0.05397906757821715
        },
        NH:
        {
            max: 0.172977037312035,
            min: 0.15163954036276334,
            mean: 0.16230828883739917,
            median: 0.16230828883739917,
            variance: 0.00022764438803008898
        },
        AK:
        {
            max: 0.06472273522903803,
            min: 0.06472273522903803,
            mean: 0.06472273522903803,
            median: 0.06472273522903803
        },
        CT:
        {
            max: 0.4391192769554272,
            min: 0.14262824535392685,
            mean: 0.2510084753258834,
            median: 0.21280274848034048,
            variance: 0.012243137352794064
        },
        ME:
        {
            max: 0.2904765312789098,
            min: 0.17341422797080872,
            mean: 0.23194537962485928,
            median: 0.23194537962485928,
            variance: 0.006851791427898929
        },
        MP:
        {
            max: 0.07695502928529178,
            min: 0.07695502928529178,
            mean: 0.07695502928529178,
            median: 0.07695502928529178
        },
        NJ:
        {
            max: 0.33937474267573514,
            min: 0.10040472741964328,
            mean: 0.19649004660478872,
            median: 0.19695265262287187,
            variance: 0.004238446413937655
        },
        KY:
        {
            max: 0.3676316082327686,
            min: 0.11567642860289645,
            mean: 0.19125960005809284,
            median: 0.14863867327709585,
            variance: 0.009491632096264028
        },
        OK:
        {
            max: 0.26974453399022597,
            min: 0.2062197291441203,
            mean: 0.25085988029282313,
            median: 0.26205785133814613,
            variance: 0.0006843881919193037
        },
        MD:
        {
            max: 0.31121413373469325,
            min: 0.03287189878222046,
            mean: 0.11337117875295656,
            median: 0.0848704372366086,
            variance: 0.007693253346265476
        },
        AL:
        {
            max: 0.2862140367744639,
            min: 0.1309837558240791,
            mean: 0.1920520796906246,
            median: 0.18249658360553492,
            variance: 0.0030940374001022252
        },
        DC:
        {
            max: 0.49397921547934087,
            min: 0.49397921547934087,
            mean: 0.49397921547934087,
            median: 0.49397921547934087
        },
        SC:
        {
            max: 0.32867810929399544,
            min: 0.08004120059191687,
            mean: 0.20650090080972783,
            median: 0.2125786166578598,
            variance: 0.009107941339738405
        },
        ND:
        {
            max: 0.5141758802531106,
            min: 0.5141758802531106,
            mean: 0.5141758802531106,
            median: 0.5141758802531106
        },
        CO:
        {
            max: 0.40078196007920464,
            min: 0.09935145127012009,
            mean: 0.24426597406968778,
            median: 0.22514097186876253,
            variance: 0.016735197455826162
        },
        RI:
        {
            max: 0.30714702345312295,
            min: 0.2638187434821855,
            mean: 0.2854828834676542,
            median: 0.2854828834676542,
            variance: 0.0009386699226199704
        },
        PA:
        {
            max: 0.46971762110210447,
            min: 0.1806917510539212,
            mean: 0.33551671923680976,
            median: 0.3244502443878216,
            variance: 0.006124812480358067
        },
        MN:
        {
            max: 0.5671173089241448,
            min: 0.22085494881674975,
            mean: 0.3299530310623484,
            median: 0.32339219909283123,
            variance: 0.011871925011103155
        },
        MT:
        {
            max: 0.4795409137114714,
            min: 0.4795409137114714,
            mean: 0.4795409137114714,
            median: 0.4795409137114714
        },
        GA:
        {
            max: 0.36651943728960584,
            min: 0.15744178096540215,
            mean: 0.26116379031636805,
            median: 0.27419222762064605,
            variance: 0.0034845767429379014
        },
        NM:
        {
            max: 0.40323385223422226,
            min: 0.2657705454638963,
            mean: 0.34981755528785613,
            median: 0.3804482681654499,
            variance: 0.005427720605600378
        },
        NV:
        {
            max: 0.5807834467174747,
            min: 0.41569970663098804,
            mean: 0.5233938996795987,
            median: 0.5485462226849661,
            variance: 0.006053827301677059
        },
        CA:
        {
            max: 0.45198009284455776,
            min: 0.0882308791775836,
            mean: 0.2372377199293647,
            median: 0.2223582003876213,
            variance: 0.005958177193332073
        },
        IA:
        {
            max: 0.48533791565631645,
            min: 0.2931797338411127,
            mean: 0.3879535986116255,
            median: 0.3866483724745365,
            variance: 0.007355221112711243
        },
        WI:
        {
            max: 0.43161869615986986,
            min: 0.16710566009842376,
            mean: 0.2916706275364886,
            median: 0.2766997670282101,
            variance: 0.006689927893537878
        },
        TN:
        {
            max: 0.29134669352843307,
            min: 0.1121389269166707,
            mean: 0.20122140363326407,
            median: 0.22629885622828136,
            variance: 0.004071160401693066
        },
        AS:
        {
            max: 0.19392764523187886,
            min: 0.19392764523187886,
            mean: 0.19392764523187886,
            median: 0.19392764523187886
        },
        AZ:
        {
            max: 0.5199585463300354,
            min: 0.12076734483542985,
            mean: 0.2993859918385231,
            median: 0.25986950243649704,
            variance: 0.021551625215314143
        },
        IN:
        {
            max: 0.5788625553933887,
            min: 0.21040661784761008,
            mean: 0.43167073719784504,
            median: 0.4670448623592573,
            variance: 0.012469703826886143
        },
        TX:
        {
            max: 0.565140197241656,
            min: 0.04501853554971014,
            mean: 0.1975139190078662,
            median: 0.18113358478830388,
            variance: 0.012492348964482881
        },
        DE:
        {
            max: 0.45952335176259107,
            min: 0.45952335176259107,
            mean: 0.45952335176259107,
            median: 0.45952335176259107
        },
        LA:
        {
            max: 0.3160465177289409,
            min: 0.056639497812910625,
            mean: 0.1435369255645906,
            median: 0.12815465400844722,
            variance: 0.008955185226287968
        },
        MA:
        {
            max: 0.38408916090815576,
            min: 0.07569857341699003,
            mean: 0.22520014138797123,
            median: 0.22615986938821336,
            variance: 0.009440848033012669
        },
        ID:
        {
            max: 0.31908675640342277,
            min: 0.18569902036284136,
            mean: 0.25239288838313206,
            median: 0.25239288838313206,
            variance: 0.00889614406301591
        },
        MS:
        {
            max: 0.40345237718374394,
            min: 0.14640335366986196,
            mean: 0.2631904299457913,
            median: 0.25145299446477964,
            variance: 0.016411621254444425
        },
        NC:
        {
            max: 0.36881127293955335,
            min: 0.1528749935376705,
            mean: 0.2466792627802616,
            median: 0.22687550576112328,
            variance: 0.00453581989863202
        },
        NE:
        {
            max: 0.44523859248054043,
            min: 0.32582645588145737,
            mean: 0.38307141554994534,
            median: 0.37814919828783833,
            variance: 0.0035829857588710566
        },
        OH:
        {
            max: 0.38881755460736556,
            min: 0.05601312622781272,
            mean: 0.1881471786904364,
            median: 0.14859635749577704,
            variance: 0.009181754508553597
        },
        MI:
        {
            max: 0.5544401848644287,
            min: 0.10455371206340106,
            mean: 0.2920631419033232,
            median: 0.24717652165617843,
            variance: 0.017229133454308952
        },
        SD:
        {
            max: 0.5576162103390644,
            min: 0.5576162103390644,
            mean: 0.5576162103390644,
            median: 0.5576162103390644
        },
        UT:
        {
            max: 0.36951579643702415,
            min: 0.20582995262816972,
            mean: 0.27972067339176365,
            median: 0.2717684722509303,
            variance: 0.004853186291769889
        },
        VI:
        {
            max: 0.30271368247193015,
            min: 0.30271368247193015,
            mean: 0.30271368247193015,
            median: 0.30271368247193015
        },
        AR:
        {
            max: 0.28291442764583524,
            min: 0.1271074885502205,
            mean: 0.19880566652497988,
            median: 0.19260037495193189,
            variance: 0.0059147898468689675
        },
        OR:
        {
            max: 0.48598091839412766,
            min: 0.14620189648114607,
            mean: 0.31111664698576225,
            median: 0.28181010779972687,
            variance: 0.0180108848813516
        },
        GU:
        {
            max: 0.6153337829559555,
            min: 0.6153337829559555,
            mean: 0.6153337829559555,
            median: 0.6153337829559555
        },
        WV:
        {
            max: 0.17915792913016343,
            min: 0.09527206981692875,
            mean: 0.137996824870701,
            median: 0.13956047566501076,
            variance: 0.0017610431010348596
        },
        VT:
        {
            max: 0.36921553387790645,
            min: 0.36921553387790645,
            mean: 0.36921553387790645,
            median: 0.36921553387790645
        },
        MO:
        {
            max: 0.4521538836240608,
            min: 0.1941790965337496,
            mean: 0.2701190944515122,
            median: 0.2338538042912635,
            variance: 0.007924384537831087
        },
        IL:
        {
            max: 0.5931896637290266,
            min: 0.0544439269799213,
            mean: 0.1885001376519517,
            median: 0.16595901266095117,
            variance: 0.014631142738633189
        },
        FL:
        {
            max: 0.6850166972403947,
            min: 0.09713769843988132,
            mean: 0.36232548404836334,
            median: 0.3699997105382811,
            variance: 0.017859583070925982
        }
    };
    let sl_lower = {
        MA:
        {
            max: 0.723388215985541,
            min: 0.04863473917532981,
            mean: 0.31619112454700254,
            median: 0.287882303044353,
            variance: 0.01505019294543988
        },
        PA:
        {
            max: 0.7256602474897687,
            min: 0.07058830189458934,
            mean: 0.2780891582656685,
            median: 0.2586145079980299,
            variance: 0.012792106214767085
        },
        NJ:
        {
            max: 0.4335816485222299,
            min: 0.1675456067584263,
            mean: 0.24885884976973896,
            median: 0.23592626275583597,
            variance: 0.0041459181085570914
        },
        KY:
        {
            max: 0.6481083657001036,
            min: 0.08788158060652324,
            mean: 0.22664785625886452,
            median: 0.2062918565127318,
            variance: 0.011526835079094846
        },
        RI:
        {
            max: 0.6969437878702931,
            min: 0.19573165445154167,
            mean: 0.40004436956550243,
            median: 0.37519592142459596,
            variance: 0.015759634830417573
        },
        GU: "Not Available",
        SD:
        {
            max: 0.7725037880695084,
            min: 0.12311680537850891,
            mean: 0.4039890686388952,
            median: 0.39748135373239574,
            variance: 0.01843311497963851
        },
        OR:
        {
            max: 0.5363519432854028,
            min: 0.10839062003323406,
            mean: 0.3248580725803175,
            median: 0.31414201583367674,
            variance: 0.009443620567405312
        },
        IN:
        {
            max: 0.667203354503639,
            min: 0.16076029342572462,
            mean: 0.3643826014068586,
            median: 0.3636407311005986,
            variance: 0.011147991974694904
        },
        PR:
        {
            max: 0.47604012815269614,
            min: 0.015132384736407423,
            mean: 0.25564283339683697,
            median: 0.23612145377664245,
            variance: 0.011294088628481054
        },
        WA:
        {
            max: 0.5926564958371687,
            min: 0.12067642522407827,
            mean: 0.3178665053056514,
            median: 0.30408986567302765,
            variance: 0.007983587654012777
        },
        UT:
        {
            max: 0.6116433246038295,
            min: 0.15563749598393453,
            mean: 0.35466091809827005,
            median: 0.3560678702776911,
            variance: 0.008047109426006008
        },
        TN:
        {
            max: 0.5179571359447087,
            min: 0.08308336294296043,
            mean: 0.23292801912923142,
            median: 0.22646137781859718,
            variance: 0.008038558351299973
        },
        NC:
        {
            max: 0.7048843516115446,
            min: 0.13405789082405445,
            mean: 0.3179035729415489,
            median: 0.3030326598282511,
            variance: 0.010882579471523884
        },
        AS: "Not Available",
        NE: "Not Available",
        MS:
        {
            max: 0.6626339049777487,
            min: 0.07331679603575149,
            mean: 0.26057878250072775,
            median: 0.23105872368494818,
            variance: 0.01375083757625235
        },
        ME:
        {
            max: 0.6658854350429046,
            min: 0.025378709217189897,
            mean: 0.3846119767055331,
            median: 0.38412715352235166,
            variance: 0.014593050987120035
        },
        OH:
        {
            max: 0.7787104766788208,
            min: 0.06745306605639056,
            mean: 0.27457673510959446,
            median: 0.2428295733268589,
            variance: 0.024148300059916295
        },
        CO:
        {
            max: 0.6705655849638755,
            min: 0.09724680592024189,
            mean: 0.28745945837622267,
            median: 0.2707760929907661,
            variance: 0.01370333236663407
        },
        VA:
        {
            max: 0.5633554265588283,
            min: 0.07657482610919239,
            mean: 0.23665039389296869,
            median: 0.21599469236602903,
            variance: 0.007658384331311694
        },
        ID:
        {
            max: 0.6586763064762617,
            min: 0.19258947519831782,
            mean: 0.41628001424663436,
            median: 0.40526844179681587,
            variance: 0.018894456707310076
        },
        VI: "Not Available",
        WY:
        {
            max: 0.5988705253235872,
            min: 0.11196269112034753,
            mean: 0.3135352989305973,
            median: 0.30691984629112334,
            variance: 0.013339624098706523
        },
        NY:
        {
            max: 0.7991050436215459,
            min: 0.08869032954697235,
            mean: 0.3085626465656542,
            median: 0.2961124714876664,
            variance: 0.015237625748757262
        },
        SC:
        {
            max: 0.5374297157053602,
            min: 0.10366917140055172,
            mean: 0.2762803655684872,
            median: 0.25811717488865527,
            variance: 0.00830426335562545
        },
        IA:
        {
            max: 0.644328870587018,
            min: 0.07656682932334581,
            mean: 0.37191178718566786,
            median: 0.37247714835464507,
            variance: 0.018017066023459642
        },
        ND:
        {
            max: 0.7456394352654078,
            min: 0.19738515994380768,
            mean: 0.4185358459615828,
            median: 0.4148819947702669,
            variance: 0.018321174175929517
        },
        DC: "Not Available",
        MO:
        {
            max: 0.7432912708863132,
            min: 0.17417487753637279,
            mean: 0.382923041600087,
            median: 0.36375515981893736,
            variance: 0.012282282077120569
        },
        FL:
        {
            max: 0.699848628834511,
            min: 0.0789737629152117,
            mean: 0.4293489927478954,
            median: 0.4345310832285809,
            variance: 0.01698188768630612
        },
        MD:
        {
            max: 0.4224350778287666,
            min: 0.002013068907922573,
            mean: 0.17696121262696873,
            median: 0.17490816647885818,
            variance: 0.012206673980975217
        },
        NH:
        {
            max: 0.7824128229199053,
            min: 0.16247119782067568,
            mean: 0.4748717713428723,
            median: 0.46362067426313114,
            variance: 0.022945276119716758
        },
        NM:
        {
            max: 0.5509541606404093,
            min: 0.10559661481618589,
            mean: 0.31368948594599516,
            median: 0.3120310822138148,
            variance: 0.012518863724211127
        },
        LA:
        {
            max: 0.5132483120542254,
            min: 0.050455119687632714,
            mean: 0.25884240728273084,
            median: 0.24881841390506387,
            variance: 0.010416912408468688
        },
        AK:
        {
            max: 0.6358357921051139,
            min: 0.03732733210458705,
            mean: 0.3703076218595892,
            median: 0.393610139300377,
            variance: 0.01964916186228287
        },
        CA:
        {
            max: 0.5202001853818952,
            min: 0.09079064135161728,
            mean: 0.2638099804181826,
            median: 0.25429700970249325,
            variance: 0.007659869153879569
        },
        HI:
        {
            max: 0.7262607012638939,
            min: 0.08514589166732663,
            mean: 0.3799649618462766,
            median: 0.3787555279987943,
            variance: 0.020969746126041952
        },
        CT:
        {
            max: 0.738747775040126,
            min: 0.13926525678376772,
            mean: 0.3851558185276327,
            median: 0.37028065145785516,
            variance: 0.015381650585783054
        },
        NV:
        {
            max: 0.5749062754137828,
            min: 0.13344079145171414,
            mean: 0.37705244534770915,
            median: 0.3833930836158166,
            variance: 0.011477038671339514
        },
        AR:
        {
            max: 0.6264296755876105,
            min: 0.10538978818253847,
            mean: 0.2733529866896257,
            median: 0.2587969704162677,
            variance: 0.0115309692024051
        },
        WI:
        {
            max: 0.5622693521513996,
            min: 0.04973848654228409,
            mean: 0.2770643109871855,
            median: 0.283095574527503,
            variance: 0.012903263083100866
        },
        WV:
        {
            max: 0.532448117357976,
            min: 0.11937438143761563,
            mean: 0.26441135021912804,
            median: 0.2281207015292943,
            variance: 0.011629707105741013
        },
        OK:
        {
            max: 0.7175410962223007,
            min: 0.1717558572461151,
            mean: 0.3992371963193848,
            median: 0.37139694802653617,
            variance: 0.017189316549800927
        },
        TX:
        {
            max: 0.626143306945775,
            min: 0.06239794983266209,
            mean: 0.26049467933622594,
            median: 0.2527705538471597,
            variance: 0.013587235390988658
        },
        MT:
        {
            max: 0.6791342258300299,
            min: 0.13792019000985503,
            mean: 0.3441908737423962,
            median: 0.3341255606131728,
            variance: 0.008784803047116242
        },
        MI:
        {
            max: 0.7857120157648827,
            min: 0.06980379400602457,
            mean: 0.39402814689348603,
            median: 0.37107110168376833,
            variance: 0.021448360034533997
        },
        AZ:
        {
            max: 0.5246975580811934,
            min: 0.1114194035294632,
            mean: 0.3058643961286597,
            median: 0.2986892320236305,
            variance: 0.009748557224853564
        },
        AL:
        {
            max: 0.4921346048658123,
            min: 0.08459405374916322,
            mean: 0.23432755259347907,
            median: 0.22775660098061776,
            variance: 0.010457287414495916
        },
        IL:
        {
            max: 0.6191032049243115,
            min: 0.08267717179146065,
            mean: 0.2694795977077148,
            median: 0.2549813817665231,
            variance: 0.011397953122068032
        },
        GA:
        {
            max: 0.5352722232485896,
            min: 0.09123436659960082,
            mean: 0.27351916114527064,
            median: 0.2601516448239759,
            variance: 0.009115588382607636
        },
        KS:
        {
            max: 0.7613389287078992,
            min: 0.20608794000415587,
            mean: 0.45890398706648117,
            median: 0.4505514963800297,
            variance: 0.01322012921953406
        },
        MN:
        {
            max: 0.650980306788917,
            min: 0.1555049423774717,
            mean: 0.4153993145665972,
            median: 0.41979427665050734,
            variance: 0.011874485457522834
        },
        DE:
        {
            max: 0.6860544125670989,
            min: 0.20800488646755874,
            mean: 0.4241193521685726,
            median: 0.39258276429460714,
            variance: 0.01637098445491542
        },
        MP: "Not Available",
        VT:
        {
            max: 0.7675052581903897,
            min: 0.15982943243083664,
            mean: 0.4784948921911068,
            median: 0.4830942692197775,
            variance: 0.019306711421394243
        }
    };
    let sl_upper = {
        MA:
        {
            max: 0.723388215985541,
            min: 0.04863473917532981,
            mean: 0.31619112454700254,
            median: 0.287882303044353,
            variance: 0.01505019294543988
        },
        PA:
        {
            max: 0.7256602474897687,
            min: 0.07058830189458934,
            mean: 0.2780891582656685,
            median: 0.2586145079980299,
            variance: 0.012792106214767085
        },
        NJ:
        {
            max: 0.4335816485222299,
            min: 0.1675456067584263,
            mean: 0.24885884976973896,
            median: 0.23592626275583597,
            variance: 0.0041459181085570914
        },
        KY:
        {
            max: 0.6481083657001036,
            min: 0.08788158060652324,
            mean: 0.22664785625886452,
            median: 0.2062918565127318,
            variance: 0.011526835079094846
        },
        RI:
        {
            max: 0.6969437878702931,
            min: 0.19573165445154167,
            mean: 0.40004436956550243,
            median: 0.37519592142459596,
            variance: 0.015759634830417573
        },
        GU: "Not Available",
        SD:
        {
            max: 0.7725037880695084,
            min: 0.12311680537850891,
            mean: 0.4039890686388952,
            median: 0.39748135373239574,
            variance: 0.01843311497963851
        },
        OR:
        {
            max: 0.5363519432854028,
            min: 0.10839062003323406,
            mean: 0.3248580725803175,
            median: 0.31414201583367674,
            variance: 0.009443620567405312
        },
        IN:
        {
            max: 0.667203354503639,
            min: 0.16076029342572462,
            mean: 0.3643826014068586,
            median: 0.3636407311005986,
            variance: 0.011147991974694904
        },
        PR:
        {
            max: 0.47604012815269614,
            min: 0.015132384736407423,
            mean: 0.25564283339683697,
            median: 0.23612145377664245,
            variance: 0.011294088628481054
        },
        WA:
        {
            max: 0.5926564958371687,
            min: 0.12067642522407827,
            mean: 0.3178665053056514,
            median: 0.30408986567302765,
            variance: 0.007983587654012777
        },
        UT:
        {
            max: 0.6116433246038295,
            min: 0.15563749598393453,
            mean: 0.35466091809827005,
            median: 0.3560678702776911,
            variance: 0.008047109426006008
        },
        TN:
        {
            max: 0.5179571359447087,
            min: 0.08308336294296043,
            mean: 0.23292801912923142,
            median: 0.22646137781859718,
            variance: 0.008038558351299973
        },
        NC:
        {
            max: 0.7048843516115446,
            min: 0.13405789082405445,
            mean: 0.3179035729415489,
            median: 0.3030326598282511,
            variance: 0.010882579471523884
        },
        AS: "Not Available",
        NE: "Not Available",
        MS:
        {
            max: 0.6626339049777487,
            min: 0.07331679603575149,
            mean: 0.26057878250072775,
            median: 0.23105872368494818,
            variance: 0.01375083757625235
        },
        ME:
        {
            max: 0.6658854350429046,
            min: 0.025378709217189897,
            mean: 0.3846119767055331,
            median: 0.38412715352235166,
            variance: 0.014593050987120035
        },
        OH:
        {
            max: 0.7787104766788208,
            min: 0.06745306605639056,
            mean: 0.27457673510959446,
            median: 0.2428295733268589,
            variance: 0.024148300059916295
        },
        CO:
        {
            max: 0.6705655849638755,
            min: 0.09724680592024189,
            mean: 0.28745945837622267,
            median: 0.2707760929907661,
            variance: 0.01370333236663407
        },
        VA:
        {
            max: 0.5633554265588283,
            min: 0.07657482610919239,
            mean: 0.23665039389296869,
            median: 0.21599469236602903,
            variance: 0.007658384331311694
        },
        ID:
        {
            max: 0.6586763064762617,
            min: 0.19258947519831782,
            mean: 0.41628001424663436,
            median: 0.40526844179681587,
            variance: 0.018894456707310076
        },
        VI: "Not Available",
        WY:
        {
            max: 0.5988705253235872,
            min: 0.11196269112034753,
            mean: 0.3135352989305973,
            median: 0.30691984629112334,
            variance: 0.013339624098706523
        },
        NY:
        {
            max: 0.7991050436215459,
            min: 0.08869032954697235,
            mean: 0.3085626465656542,
            median: 0.2961124714876664,
            variance: 0.015237625748757262
        },
        SC:
        {
            max: 0.5374297157053602,
            min: 0.10366917140055172,
            mean: 0.2762803655684872,
            median: 0.25811717488865527,
            variance: 0.00830426335562545
        },
        IA:
        {
            max: 0.644328870587018,
            min: 0.07656682932334581,
            mean: 0.37191178718566786,
            median: 0.37247714835464507,
            variance: 0.018017066023459642
        },
        ND:
        {
            max: 0.7456394352654078,
            min: 0.19738515994380768,
            mean: 0.4185358459615828,
            median: 0.4148819947702669,
            variance: 0.018321174175929517
        },
        DC: "Not Available",
        MO:
        {
            max: 0.7432912708863132,
            min: 0.17417487753637279,
            mean: 0.382923041600087,
            median: 0.36375515981893736,
            variance: 0.012282282077120569
        },
        FL:
        {
            max: 0.699848628834511,
            min: 0.0789737629152117,
            mean: 0.4293489927478954,
            median: 0.4345310832285809,
            variance: 0.01698188768630612
        },
        MD:
        {
            max: 0.4224350778287666,
            min: 0.002013068907922573,
            mean: 0.17696121262696873,
            median: 0.17490816647885818,
            variance: 0.012206673980975217
        },
        NH:
        {
            max: 0.7824128229199053,
            min: 0.16247119782067568,
            mean: 0.4748717713428723,
            median: 0.46362067426313114,
            variance: 0.022945276119716758
        },
        NM:
        {
            max: 0.5509541606404093,
            min: 0.10559661481618589,
            mean: 0.31368948594599516,
            median: 0.3120310822138148,
            variance: 0.012518863724211127
        },
        LA:
        {
            max: 0.5132483120542254,
            min: 0.050455119687632714,
            mean: 0.25884240728273084,
            median: 0.24881841390506387,
            variance: 0.010416912408468688
        },
        AK:
        {
            max: 0.6358357921051139,
            min: 0.03732733210458705,
            mean: 0.3703076218595892,
            median: 0.393610139300377,
            variance: 0.01964916186228287
        },
        CA:
        {
            max: 0.5202001853818952,
            min: 0.09079064135161728,
            mean: 0.2638099804181826,
            median: 0.25429700970249325,
            variance: 0.007659869153879569
        },
        HI:
        {
            max: 0.7262607012638939,
            min: 0.08514589166732663,
            mean: 0.3799649618462766,
            median: 0.3787555279987943,
            variance: 0.020969746126041952
        },
        CT:
        {
            max: 0.738747775040126,
            min: 0.13926525678376772,
            mean: 0.3851558185276327,
            median: 0.37028065145785516,
            variance: 0.015381650585783054
        },
        NV:
        {
            max: 0.5749062754137828,
            min: 0.13344079145171414,
            mean: 0.37705244534770915,
            median: 0.3833930836158166,
            variance: 0.011477038671339514
        },
        AR:
        {
            max: 0.6264296755876105,
            min: 0.10538978818253847,
            mean: 0.2733529866896257,
            median: 0.2587969704162677,
            variance: 0.0115309692024051
        },
        WI:
        {
            max: 0.5622693521513996,
            min: 0.04973848654228409,
            mean: 0.2770643109871855,
            median: 0.283095574527503,
            variance: 0.012903263083100866
        },
        WV:
        {
            max: 0.532448117357976,
            min: 0.11937438143761563,
            mean: 0.26441135021912804,
            median: 0.2281207015292943,
            variance: 0.011629707105741013
        },
        OK:
        {
            max: 0.7175410962223007,
            min: 0.1717558572461151,
            mean: 0.3992371963193848,
            median: 0.37139694802653617,
            variance: 0.017189316549800927
        },
        TX:
        {
            max: 0.626143306945775,
            min: 0.06239794983266209,
            mean: 0.26049467933622594,
            median: 0.2527705538471597,
            variance: 0.013587235390988658
        },
        MT:
        {
            max: 0.6791342258300299,
            min: 0.13792019000985503,
            mean: 0.3441908737423962,
            median: 0.3341255606131728,
            variance: 0.008784803047116242
        },
        MI:
        {
            max: 0.7857120157648827,
            min: 0.06980379400602457,
            mean: 0.39402814689348603,
            median: 0.37107110168376833,
            variance: 0.021448360034533997
        },
        AZ:
        {
            max: 0.5246975580811934,
            min: 0.1114194035294632,
            mean: 0.3058643961286597,
            median: 0.2986892320236305,
            variance: 0.009748557224853564
        },
        AL:
        {
            max: 0.4921346048658123,
            min: 0.08459405374916322,
            mean: 0.23432755259347907,
            median: 0.22775660098061776,
            variance: 0.010457287414495916
        },
        IL:
        {
            max: 0.6191032049243115,
            min: 0.08267717179146065,
            mean: 0.2694795977077148,
            median: 0.2549813817665231,
            variance: 0.011397953122068032
        },
        GA:
        {
            max: 0.5352722232485896,
            min: 0.09123436659960082,
            mean: 0.27351916114527064,
            median: 0.2601516448239759,
            variance: 0.009115588382607636
        },
        KS:
        {
            max: 0.7613389287078992,
            min: 0.20608794000415587,
            mean: 0.45890398706648117,
            median: 0.4505514963800297,
            variance: 0.01322012921953406
        },
        MN:
        {
            max: 0.650980306788917,
            min: 0.1555049423774717,
            mean: 0.4153993145665972,
            median: 0.41979427665050734,
            variance: 0.011874485457522834
        },
        DE:
        {
            max: 0.6860544125670989,
            min: 0.20800488646755874,
            mean: 0.4241193521685726,
            median: 0.39258276429460714,
            variance: 0.01637098445491542
        },
        MP: "Not Available",
        VT:
        {
            max: 0.7675052581903897,
            min: 0.15982943243083664,
            mean: 0.4784948921911068,
            median: 0.4830942692197775,
            variance: 0.019306711421394243
        }
    };
    switch(districts) {
        case "Congress": 
        case "2020 Reapportioned Congress":
            return cong[state_name_to_postal(st)];
        case "State Senate":
            return sl_upper[state_name_to_postal(st)];
        case "State House":
        case "State Assembly":
        case "House of Delegates":
            return sl_lower[state_name_to_postal(st)];
    }
    return false;
}

function state_name_to_postal(st) {
    let results = {
    'Alabama': 'AL',
    'Alaska': 'AK',
    'Arizona': 'AZ',
    'Arkansas': 'AR',
    'California': 'CA',
    'Colorado': 'CO',
    'Connecticut': 'CT',
    'Delaware': 'DE',
    'District of Columbia': 'DC',
    'Florida': 'FL',
    'Georgia': 'GA',
    'Hawaii': 'HI',
    'Idaho': 'ID',
    'Illinois': 'IL',
    'Indiana': 'IN',
    'Iowa': 'IA',
    'Kansas': 'KS',
    'Kentucky': 'KY',
    'Louisiana': 'LA',
    'Maine': 'ME',
    'Maryland': 'MD',
    'Massachusetts': 'MA',
    'Michigan': 'MI',
    'Minnesota': 'MN',
    'Mississippi': 'MS',
    'Missouri': 'MO',
    'Montana': 'MT',
    'Nebraska': 'NE',
    'Nevada': 'NV',
    'New Hampshire': 'NH',
    'New Jersey': 'NJ',
    'New Mexico': 'NM',
    'New York': 'NY',
    'North Carolina': 'NC',
    'North Dakota': 'ND',
    'Ohio': 'OH',
    'Oklahoma': 'OK',
    'Oregon': 'OR',
    'Pennsylvania': 'PA',
    'Rhode Island': 'RI',
    'South Carolina': 'SC',
    'South Dakota': 'SD',
    'Tennessee': 'TN',
    'Texas': 'TX',
    'Utah': 'UT',
    'Vermont': 'VT',
    'Virginia': 'VA',
    'Washington': 'WA',
    'West Virginia': 'WV',
    'Wisconsin': 'WI',
    'Wyoming': 'WY',
    'Washington, DC': 'DC',
    'Puerto Rico': 'PR'
    }
    return results[st];
}

