
import { html, render } from "lit-html";
import DisplayPane from "../components/DisplayPane";
import Button from "../components/Button";
import { renderModal, closeModal } from "../components/Modal";
import { loadPlanFromURL, loadPlanFromJSON } from "../routes";
import { MapState } from "../map";
import State from "../models/State";
import { Slide, SlideShow } from "../components/Slides";
import AbstractBarChart from "../components/Charts/AbstractBarChart";
import populateDatasetInfo from "../components/Charts/DatasetInfo";
import { getCell, getCellStyle, getCellSeatShare, parseElectionName } from "../components/Charts/PartisanSummary";
import { getPartyRGBColors } from "../layers/color-rules"
import { DataTable } from "../components/Charts/DataTable"
import { interpolateRdBu } from "d3-scale-chromatic";
import { roundToDecimal } from "../utils";
import { districtColors } from "../colors";
import PlanUploader from "../components/PlanUploader";



/**
 * @desc Retrieves a test plan if we're doing dev work, the real deal if we
 * aren't.
 * @param {String} url URL from which we load the plan.
 * @returns {Promise}
 */
function loadPlan(url) {
    if (_isDev()) return loadPlanFromURL("/assets/mi-plans/state_house.json");
    return loadPlanFromURL(url);
}

/**
 * @desc Retrieves the proper map style; uses the same rules as the Editor.
 * @param {Object} context Context object retrieved from the database.
 * @returns {string} Proper map formatting style.
 */
function getMapStyle(context) {
    return "mapbox://styles/mapbox/light-v10";
}

/**
 * @desc Is this program being run in development mode?
 * @returns {boolean} See above.
 * @private
 */
function _isDev() {
    return window.location.href.includes("localhost:");
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
    // TODO can we use the cool street-based map for this one? I *love* that
    //  style.
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
            }
        },
        getMapStyle(context)
    );
    
    // Set a callback for when the map has loaded from the database; create a
    // new State object (which will go unused, as the user cannot edit the
    // plan while it's being analyzed) and render the map to the page. Again
    // follows the protocol set out in edit.js.
    let state;
    mapState.map.on("load", () => {
        state = new State(
            mapState.map,
            mapState.swipemap,
            context,
            () => {}
        );
        
        if (context.assignment) state.plan.assignment = context.assignment;
        state.render();
        renderRight(new DisplayPane({ id: "analysis-right" }), context, state);
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
            <div id="swipemap" class="map"></div>
        </div>
    `;

    // Render the template to the Pane, render the Map, and close the
    // Modal.
    pane.render();
    renderMap("map", context);
}

/**
 * @desc Renders the right Pane to the desired content, which is the SlideShow
 * of analysis things.
 * @param {DisplayPane} pane The DisplayPane on the right.
 * @param {Object} context Context object.
 * @returns {undefined}
 */
function renderRight(pane, context, state) {

    let saveplan = state.serialize();
    const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
    fetch(GERRYCHAIN_URL + "/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveplan),
    }).then((res) => res.json())
      .catch((e) => console.error(e))
      .then((data) => {
            console.log(data);
            // Create the charts for the Slides.
            let slides = [
                new Slide(overview_slide(state, data.contiguity, data.split), "Overview"),
                // overview (show 1)
                new Slide(election_slide(state), "Election Results"),
                // compactness (cut edges, polsby popper)
                new Slide(compactness_slide(state, data.cut_edges, "congress"), "Compactness")
                // counties split and county splits
                
                    /** ANTHONY'S SLIDES */
                    //new Slide(partisan(state), "Partisanship"),
                    //new Slide(cutedges(state), "Cut Edges"),
                ],
                s = new SlideShow(pane.pane, slides);

            s.render();
        });
}

/**
 * @desc Wrapper which returns a callback function to the "Go" button on the
 * userSelectsMode modal. Once the plan is loaded from the database (or wherever
 * else), this function renders the desired plan on the map and closes the modal.
 * @param {DisplayPane} left Pane where the Map is going to go.
 * @param {DisplayPane} right Pane where the analysis will happen.
 */
function userOnGo(left, type) {
    // Create a function that does the proper thing when loading.
    return e => {
        // Get the URL, JSON file, or enacted plan provided by the user.
        // TODO do the last two things.
        let url = document.getElementById("shareable-url").value;
        let plan = loadPlan(url);
    
        // Disable the Go button.
        e.target.disabled = true;
        
        plan.then(context => {
            renderLeft(left, context);
            // right gets rendered within the left pane, since we need the mapstate            
            // Close the modal.
            closeModal();
        });
    };
}

/**
 * @desc Renders the first thing that loads on the Analysis page: a modal that
 * allows the user to select whether they want to load a map from a Districtr
 * link, load a Districtr JSON or CSV file, or choose an enacted plan to explore.
 * @param {DisplayPane} left Pane in which the map will be rendered.
 * @returns {undefined}
 */
function userSelectsMode(left) {
    // Create a new Button.
    let go = new Button(userOnGo(left, "load"), { label: "Go.", hoverText: "Evaluate the selected plan." }),
        upload = new PlanUploader(fileContent => {
            loadPlanFromJSON(JSON.parse(fileContent)).then(context => {
                renderLeft(left, context);
                closeModal();
            });
        }),
        target = document.getElementById("modal"),
    
        
        // Create the internal HTMLTemplate for the modal, including the
        // Button.
        template = html`
            <div class="modal-row">
                <div class="modal-item" id="url">
                    <h3>Existing</h3>
                    <p>
                        Paste the shareable URL for an existing Districtr
                        plan.
                    </p>
                    <input type="url" id="shareable-url">
                    <div class="bottom-bar">${go}</div>
                </div>
                <div class="modal-item" id="upload">
                    <h3>Upload</h3>
                    <p>
                        Upload a Districtr JSON or CSV file from your computer.
                    </p>
                    <div id="uploader" class="bottom-bar"></div>
                </div>
                <div class="modal-item" id="enacted">
                    <h3>Enacted</h3>
                    <p>
                        Analyze an enacted districting plan.
                    </p>
                    <div class="bottom-bar"><strong>In progress</strong></div>
                </div>
            </div>
        `,
        modal = renderModal(template);
        
    // Render inner content.
    render(modal, target);
    render(upload.render(), document.getElementById("uploader"));
}

/**
 * @desc Renders the Analysis view.
 * @returns {undefined}
 */
export default function renderAnalysisView() {
    // Create left display pane.
    // hold on creating the right one, bc we need the mapstate first
    let left = new DisplayPane({ id: "analysis-left" });


    // Spits out the Modal right when we load.
    userSelectsMode(left);
}



/***** SLIDES ******/
/**
 * @desc A placeholder function for doing a cut-edges page. This will obviously
 * have to change.
 * TODO find a better way to create/encode individual Slides so we don't have to
 *  do all this in the Analysis page *and* so we can create Slides based on
 *  whatever data we have.
 * @param {Object} context Database context object.
 * @returns {HTMLTemplateElement}
 */
 function cutedges(context) {
    let hticks = [],
        vticks = [],
        hlabels = [],
        vlabels = [],
        heights = [0, 0, 0, 0.5, 0.3, 0.15, 0.1, 0.08, 0.07],
        bins = [],
        descriptionHeader = html`
            <div class="dataset-info">
                ${populateDatasetInfo(context)}
            </div>
        `,
        descriptionText = html`
            Here, we can talk about cut edges and other compactness stuff. I
            mean honestly we can put whatever we want here, including a
            description of what "cut edges" <i>means</i>, but I think being able
            to switch back and forth between charts is important.
        `,
        description = html`${descriptionHeader}${descriptionText}`;
    
            
    for (let i=10; i<100; i+=10) {
        hticks.push(i/100);
        hlabels.push(i.toString());
        
        vticks.push(i/100);
        vlabels.push((i/10).toString());
        
        bins.push([(i-10)/100, (i/100)]);
    }
    
    return AbstractBarChart(
        hticks, vticks,
        {
            hlabels: hlabels,
            vlabels: vlabels,
            heights: heights,
            bins: bins,
            description: description
        }
    );
}

/**
 * @desc Just a copy of the above ``cutedges`` function.
 * @param {Object} context Database context object.
 * @returns {HTMLTemplateElement}
 */
function partisan(context) {
    let hticks = [],
        vticks = [],
        hlabels = [],
        vlabels = [],
        heights = [0, 0, 0.1, 0.3, 0.5, 0.3, 0.1, 0, 0],
        bins = [],
        descriptionHeader = html`
            <div class="dataset-info">
                ${populateDatasetInfo(context)}
            </div>
        `,
        descriptionText = html`
            Here, we'll evalulate partisanship. In this chart, we
            talk about whatever we want to with regard to some measure of
            partisanship.
        `,
        description = html`${descriptionHeader}${descriptionText}`;
    
    for (let i=10; i<100; i+=10) {
        hticks.push(i/100);
        hlabels.push(i.toString());
        
        vticks.push(i/100);
        vlabels.push((i/10).toString());
        
        bins.push([(i-10)/100, (i/100)]);
    }
    
    return AbstractBarChart(
        hticks, vticks,
        {
            hlabels: hlabels,
            vlabels: vlabels,
            heights: heights,
            bins: bins,
            description: description
        }
    );
}

// Overview Slide
function overview_slide (state, contig, problems) {
    // contiguity
    let contig_section = html`<h4 id="contiguity-status">
        ${contig ? "No contiguity gaps detected" 
            : html`The following districts have contiguity gaps:
        </h4>
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
                </span>`})}</div>`}`
    
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
    let pop_section = html`<div style="text-align:left"><strong>Population deviation</strong>
    is the percentage difference in population between districts and the ideal population of a district,
    were the population to be split perfectly evenly. 
    The population deviation of a district plan should always be less than 5%, though some states require it to be smaller.<br/>
    Your plan's most populous district is district  
    <span
        class="part-number"
        style="background:${districtColors[argmax % districtColors.length].hex};
        display:inline-flex"
    >
        ${Number(argmax) + 1}
    </span> and your plan's least populous district is district  
    <span
        class="part-number"
        style="background:${districtColors[argmin % districtColors.length].hex};
        display:inline-flex"
    >
    ${Number(argmin) + 1}
    </span>.<br/> 
    The maxiumum population deviation of your plan is ${Math.abs(roundToDecimal(max * 100, 2))}%.`;
    return html`${contig_section}${pop_section}</div>`;
}

// Election Results Slide
function election_slide(state) {
    let elections = state.elections;
    let rows = [];

    let headers = 
        elections[0].parties.map(party => {
        const rgb = getPartyRGBColors(party.name + party.key);
        return html`<div style="color: rgb(${rgb[0]},${rgb[1]},${rgb[2]})">${party.name.substring(0,3)} Votes</div>`}).concat(
        elections[0].parties.map(party => {
            const rgb = getPartyRGBColors(party.name + party.key);
            return html`<div style="color: rgb(${rgb[0]},${rgb[1]},${rgb[2]})">${party.name.substring(0,3)} Seats</div>`})).concat(
                [html`<div>Biased To</div>`]
            );
        
    let bias_acc = []
    for (let election of elections) {
        let votes = election.parties.map(party => getCell(party, null)),
            seats = election.parties.map(party => getCellSeatShare(party, election));
            let d_votes = election.parties[0].getOverallFraction(),
            d_seats = election.getSeatsWonParty(election.parties[0]);
        let bias_to = (d_votes > d_seats) ? "R" : "D";
        console.log(d_seats);


        // > 0 if biased towards Rs, < 0 if toward Ds
        let bias_by = Math.round((d_votes - d_seats) * election.total.data.length * 10)/10;
        bias_acc.push(bias_by);
        
        let biases = [
            (bias_to == "R") ? {content: `Republicans by ${Math.abs(bias_by)} seats`, style: `background: ${interpolateRdBu(.2)}`}
                             : {content: `Democrats by ${Math.abs(bias_by)} seats`, style: `background: ${interpolateRdBu(.8)}`}    
        ]

        rows.push({
            label: parseElectionName(election.name),
            entries: votes.concat(seats).concat(biases)
        });
    }
    let avg_bias = roundToDecimal(bias_acc.reduce((a,b) => a + b, 0)/bias_acc.length, 1);
    let var_bias = roundToDecimal(bias_acc.map(b => Math.pow(b-avg_bias, 2)).reduce((a,b) => a + b)/bias_acc.length, 2);
    return html`
        Your plan has an average bias of ${avg_bias} seats towards 
        <strong>${(avg_bias > 0) ? html`Republicans` : html`Democrats`}</strong> over
        ${bias_acc.length} elections, with a variance of ${var_bias}.
        <br/>
        ${elections[0].parties.length === 2 ? html`<strong>two-way vote share</strong>` : ""}
        ${DataTable(headers, rows)}
        `;
}

// Compactness slide (cut edges, polsby popper)
function compactness_slide(state, cut_edges) {
    // Polsby Popper Scores
    // place holders, I c/p'd them from CT
    let tmp_plan_scores = {
        max: 0.4396800786973772,
        min: 0.1757496474754079,
        mean: 0.27257163358251413,
        median: 0.2257907320082957,
        variance: 0.011882525506876837
    };
    let plan = tmp_plan_scores;
    let columns = ["Max", "Min", "Mean", "Median", "Variance"]
    console.log(state);
    let rows = [], headers, comparison;
    let enacted = polsby_popper(state.place.name, state.plan.problem.name);
    if (enacted) {
        headers = ["Your Plan", "Enacted Plan"];
        for (let c of columns) {
            rows.push({
                label: c,
                entries: [
                    {content: roundToDecimal(plan[c.toLowerCase()], 3)},
                    {content: roundToDecimal(enacted[c.toLowerCase()], 3)}
            ]})
        }
        let mean_diff = enacted.mean - plan.mean;
        if (mean_diff > 0.2)
            comparison = "significantly less compact than"
        else if (mean_diff > 0.05)
            comparison = "slightly less compact than"
        else if (mean_diff > -0.05)
            comparison = "about as compact as"
        else if (mean_diff > 0.2)
            comparison = "slightly more compact than"
        else
            comparison = "significantly more compact than"
    }
    else {
        headers = ["Enacted Plan"];
        for (let c of columns) {
            rows.push({
                label: c,
                entries: [
                    {content: roundToDecimal(plan[c.toLowerCase()], 3)},
            ]})
        }
    }
    let polsbypopper_table = DataTable(headers, rows);
    return html`
        <h3>Cut Edges</h3>
        <div style='text-align: left'>
        One measure of compactness is the number of <strong>cut edges</strong> in a districting plan.
        You can think of the number of cut edges as the number of adjacent building blocks that
        end up in different districts in a plan. A lower number of cut edges means a plan is more compact.
        When comparing the number of cut edges between plans, you must be sure to be using the same
        units when drawing the plans.<br/>
        Your plan has <strong>${cut_edges}</strong> cut edges.
        </div>
        <br/>        
        <h3>Polsby Popper Scores</h3>
        <div style='text-align: left'>
        Another measure of compactness is the <strong>Polsby Popper score</strong>, which is a ratio
        of the area of a district to it's perimeter. When calculating Polsby Popper scores, one
        must take care to choose a proper map projection. Ours are calculated with the EPSG 4326 projection. 
        A higher Polsby Popper score means a more compact district.<br/><br/>
        ${enacted ? html`According to Polsby Popper scores, your average district is 
        <strong>${comparison}</strong> the average enacted district.` 
        : html`Enacted Polsby Popper Scores are not available for this districting problem.`}
        <div>
        ${polsbypopper_table}
        `;
}

// County Splits slide
function county_slide(state) {

}

/** LOOKUP FUNCTIONS */
function polsby_popper(st, districts) {
    let state_name_to_postal = {
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
    };
    let cong = {
        WY:
        {
            max: 0.7262678795117583,
            min: 0.7262678795117583,
            mean: 0.7262678795117583,
            median: 0.7262678795117583
        },
        MI:
        {
            max: 0.519681025059573,
            min: 0.09679983654282197,
            mean: 0.2789895899657467,
            median: 0.24434063453307783,
            variance: 0.016243356572738156
        },
        VA:
        {
            max: 0.26312746989061697,
            min: 0.09216310019394822,
            mean: 0.18236294818763443,
            median: 0.19495605234785446,
            variance: 0.0025916564150213566
        },
        PR:
        {
            max: 0.2683155611780764,
            min: 0.2683155611780764,
            mean: 0.2683155611780764,
            median: 0.2683155611780764
        },
        LA:
        {
            max: 0.3034814183282353,
            min: 0.05598913800381989,
            mean: 0.13971596354954244,
            median: 0.12507518006840085,
            variance: 0.008134689193071743
        },
        AS:
        {
            max: 0.19310331717106435,
            min: 0.19310331717106435,
            mean: 0.19310331717106435,
            median: 0.19310331717106435
        },
        RI:
        {
            max: 0.32848759096497476,
            min: 0.2686986788837495,
            mean: 0.2985931349243621,
            median: 0.2985931349243621,
            variance: 0.001787357003928243
        },
        NY:
        {
            max: 0.5505537975380198,
            min: 0.09010001437770027,
            mean: 0.33230093968279883,
            median: 0.32654996364835315,
            variance: 0.01339340452181047
        },
        HI:
        {
            max: 0.3866084205679521,
            min: 0.0646461603572779,
            mean: 0.22562729046261498,
            median: 0.22562729046261498,
            variance: 0.05182984849998294
        },
        VI:
        {
            max: 0.2990950331007587,
            min: 0.2990950331007587,
            mean: 0.2990950331007587,
            median: 0.2990950331007587
        },
        NJ:
        {
            max: 0.33748064652116594,
            min: 0.09876371794152665,
            mean: 0.1933283177129718,
            median: 0.19470012649920126,
            variance: 0.004130418967806679
        },
        CO:
        {
            max: 0.37293847382827794,
            min: 0.0953831232621782,
            mean: 0.23540775543448492,
            median: 0.22351202918279336,
            variance: 0.015562786112671034
        },
        GU:
        {
            max: 0.6163687203111025,
            min: 0.6163687203111025,
            mean: 0.6163687203111025,
            median: 0.6163687203111025
        },
        IA:
        {
            max: 0.4393855814466617,
            min: 0.26240356462116116,
            mean: 0.3496741030913698,
            median: 0.34845363314882827,
            variance: 0.00589266017968926
        },
        IN:
        {
            max: 0.5609712995088839,
            min: 0.21721200118837125,
            mean: 0.435799621312027,
            median: 0.46056433212298725,
            variance: 0.012135559562353144
        },
        WV:
        {
            max: 0.17731670344365946,
            min: 0.09307051614427828,
            mean: 0.13646762982914487,
            median: 0.1390156698994969,
            variance: 0.0017792243997706938
        },
        AK:
        {
            max: 0.06211703450639587,
            min: 0.06211703450639587,
            mean: 0.06211703450639587,
            median: 0.06211703450639587
        },
        CA:
        {
            max: 0.4578952139455661,
            min: 0.08439960515091854,
            mean: 0.23250568077385853,
            median: 0.2180509133550853,
            variance: 0.005812646031249127
        },
        OH:
        {
            max: 0.3471720086552197,
            min: 0.05570402312591262,
            mean: 0.18272084893519802,
            median: 0.1456522879624672,
            variance: 0.00838934663487169
        },
        UT:
        {
            max: 0.3621091953060423,
            min: 0.20315143405810385,
            mean: 0.2711478544546504,
            median: 0.2596653942272277,
            variance: 0.004539120243586259
        },
        OR:
        {
            max: 0.4418465954016443,
            min: 0.13935999059161064,
            mean: 0.2919780834951453,
            median: 0.26085729432951477,
            variance: 0.01563533282266863
        },
        MD:
        {
            max: 0.3155490474499603,
            min: 0.03220419413847352,
            mean: 0.11225498490799096,
            median: 0.08333281883366725,
            variance: 0.008049080491328802
        },
        MN:
        {
            max: 0.5281392346332422,
            min: 0.21353754329604266,
            mean: 0.3099313969188079,
            median: 0.2772157731945609,
            variance: 0.010476876442771899
        },
        NV:
        {
            max: 0.5570542720242093,
            min: 0.4155645291694011,
            mean: 0.5071952431409649,
            median: 0.5280810856851246,
            variance: 0.004140851125117393
        },
        VT:
        {
            max: 0.36376867947387254,
            min: 0.36376867947387254,
            mean: 0.36376867947387254,
            median: 0.36376867947387254
        },
        OK:
        {
            max: 0.2701014779512903,
            min: 0.2069875789829798,
            mean: 0.2486098728640421,
            median: 0.25003185679127937,
            variance: 0.0006420909585804657
        },
        NH:
        {
            max: 0.1739318733075716,
            min: 0.1508902002514126,
            mean: 0.1624110367794921,
            median: 0.1624110367794921,
            variance: 0.00026545934861346194
        },
        DE:
        {
            max: 0.4918436960493312,
            min: 0.4918436960493312,
            mean: 0.4918436960493312,
            median: 0.4918436960493312
        },
        PA:
        {
            max: 0.4692119206455437,
            min: 0.17206958609238154,
            mean: 0.32389872524933433,
            median: 0.31458225130964745,
            variance: 0.006501364293974057
        },
        AZ:
        {
            max: 0.5165858292667825,
            min: 0.12058756269061162,
            mean: 0.2932551693246387,
            median: 0.2463020876625767,
            variance: 0.020370629307853317
        },
        ME:
        {
            max: 0.29639666055980335,
            min: 0.16638660431254748,
            mean: 0.23139163243617542,
            median: 0.23139163243617542,
            variance: 0.008451307362707317
        },
        WI:
        {
            max: 0.40982129469391787,
            min: 0.16641897531230207,
            mean: 0.27604281001538306,
            median: 0.2545845007106932,
            variance: 0.005380729150767862
        },
        AR:
        {
            max: 0.2800479501275895,
            min: 0.12317363341814277,
            mean: 0.19602264230795105,
            median: 0.19043449284303599,
            variance: 0.005837861275520465
        },
        WA:
        {
            max: 0.4666556049078541,
            min: 0.15739026812836784,
            mean: 0.2702773760281258,
            median: 0.2333682597351737,
            variance: 0.010693626132009248
        },
        TX:
        {
            max: 0.5415735849804493,
            min: 0.04405969662987435,
            mean: 0.19497351795302437,
            median: 0.17872850039364696,
            variance: 0.012000596191846962
        },
        TN:
        {
            max: 0.2858368138094331,
            min: 0.10875324823543225,
            mean: 0.1927127566020008,
            median: 0.21486517471037755,
            variance: 0.003718876995881438
        },
        GA:
        {
            max: 0.3609195146715783,
            min: 0.1566031570145887,
            mean: 0.2573056156008101,
            median: 0.26829819613321354,
            variance: 0.0033969315482017376
        },
        FL:
        {
            max: 0.6841956105579801,
            min: 0.0915344535573838,
            mean: 0.360609421287585,
            median: 0.3668270730426326,
            variance: 0.01790151573951387
        },
        MO:
        {
            max: 0.4426672653927414,
            min: 0.1870358226452158,
            mean: 0.2612881683455657,
            median: 0.22375218179384043,
            variance: 0.007575217656837899
        },
        ND:
        {
            max: 0.43269329549137164,
            min: 0.43269329549137164,
            mean: 0.43269329549137164,
            median: 0.43269329549137164
        },
        MT:
        {
            max: 0.4204016905571481,
            min: 0.4204016905571481,
            mean: 0.4204016905571481,
            median: 0.4204016905571481
        },
        NE:
        {
            max: 0.4139385259751897,
            min: 0.3065911516253826,
            mean: 0.3498311669477379,
            median: 0.32896382324264156,
            variance: 0.003207449219929376
        },
        ID:
        {
            max: 0.3095533365876836,
            min: 0.19570571278925938,
            mean: 0.2526295246884715,
            median: 0.2526295246884715,
            variance: 0.006480640722273762
        },
        MA:
        {
            max: 0.3723483115681691,
            min: 0.07164855767211836,
            mean: 0.21608533061997712,
            median: 0.21139792752928716,
            variance: 0.008423942901583362
        },
        NC:
        {
            max: 0.36621430865601096,
            min: 0.15055581319742645,
            mean: 0.23970091100507324,
            median: 0.2190171532659683,
            variance: 0.0044792855187418
        },
        MP:
        {
            max: 0.07683028807766779,
            min: 0.07683028807766779,
            mean: 0.07683028807766779,
            median: 0.07683028807766779
        },
        MS:
        {
            max: 0.40556961694673355,
            min: 0.14577494703502467,
            mean: 0.2623099252585708,
            median: 0.24894756852626243,
            variance: 0.016903025604866187
        },
        IL:
        {
            max: 0.5913456165180945,
            min: 0.050623166795290726,
            mean: 0.185655666447057,
            median: 0.1592661288093996,
            variance: 0.01492882019839816
        },
        NM:
        {
            max: 0.399505132079756,
            min: 0.2560201250519655,
            mean: 0.3403201021781263,
            median: 0.3654350494026573,
            variance: 0.00562005724100951
        },
        CT:
        {
            max: 0.41328070042448656,
            min: 0.12129451328802845,
            mean: 0.2409310074557687,
            median: 0.21352081238808868,
            variance: 0.011182116743495795
        },
        SC:
        {
            max: 0.32275861163180053,
            min: 0.07877353271250806,
            mean: 0.20218059094451893,
            median: 0.2072821454189619,
            variance: 0.008694670361182951
        },
        KY:
        {
            max: 0.3549695847021776,
            min: 0.1123139968364038,
            mean: 0.18403822635138636,
            median: 0.14436263172115774,
            variance: 0.008848209290817474
        },
        SD:
        {
            max: 0.4975914287721562,
            min: 0.4975914287721562,
            mean: 0.4975914287721562,
            median: 0.4975914287721562
        },
        DC:
        {
            max: 0.4929107913204429,
            min: 0.4929107913204429,
            mean: 0.4929107913204429,
            median: 0.4929107913204429
        },
        AL:
        {
            max: 0.26258530931496926,
            min: 0.13167652435024074,
            mean: 0.18763760291692427,
            median: 0.18527779844264033,
            variance: 0.0024449127177171275
        },
        KS:
        {
            max: 0.49046060882678644,
            min: 0.35692110308256714,
            mean: 0.40768210125856336,
            median: 0.3916733465624499,
            variance: 0.0033751680804015027
        }
    };
    let sl_lower = {
        AZ:
        {
            max: 0.5392443683452036,
            min: 0.11209411135659558,
            mean: 0.29985252077942737,
            median: 0.28295570130975783,
            variance: 0.009744282039574758
        },
        SC:
        {
            max: 0.5253474760148745,
            min: 0.10055838694206339,
            mean: 0.27244885727177204,
            median: 0.2560905515510176,
            variance: 0.008184603540300851
        },
        MA:
        {
            max: 0.6930868933572788,
            min: 0.04795948762053741,
            mean: 0.30618824012785795,
            median: 0.27905511318412396,
            variance: 0.014162135479708526
        },
        AR:
        {
            max: 0.6348651912221112,
            min: 0.1041183260982768,
            mean: 0.26783652703513466,
            median: 0.2532480377178616,
            variance: 0.011315140287976259
        },
        MP: false,
        PA:
        {
            max: 0.7552462028054057,
            min: 0.06816551345131881,
            mean: 0.26945740902911935,
            median: 0.2466552706367729,
            variance: 0.012380090239877293
        },
        NM:
        {
            max: 0.5540475153063676,
            min: 0.10575741693173897,
            mean: 0.307149876469839,
            median: 0.3003149603575296,
            variance: 0.012223872462947425
        },
        ME:
        {
            max: 0.6454022056561982,
            min: 0.025374792554800383,
            mean: 0.3779496316137612,
            median: 0.3732252668622294,
            variance: 0.01394374575861356
        },
        NV:
        {
            max: 0.5925261568899478,
            min: 0.12491349099835007,
            mean: 0.3749474706131928,
            median: 0.365545569231826,
            variance: 0.012187540751792117
        },
        DC: false,
        IL:
        {
            max: 0.6196984281117189,
            min: 0.08547930633357392,
            mean: 0.2644964120557204,
            median: 0.25316026641101225,
            variance: 0.011110819735508669
        },
        DE:
        {
            max: 0.6698707937768869,
            min: 0.20653471899714884,
            mean: 0.41086984100251034,
            median: 0.36878536045794563,
            variance: 0.017135069795863034
        },
        FL:
        {
            max: 0.6860368969913093,
            min: 0.08184895691348007,
            mean: 0.42704891136060297,
            median: 0.4359376111829224,
            variance: 0.016825517701956564
        },
        AK:
        {
            max: 0.6501693786385161,
            min: 0.037260888407306514,
            mean: 0.311974130691328,
            median: 0.3148653292870418,
            variance: 0.018216891738533848
        },
        NJ:
        {
            max: 0.4196168823833186,
            min: 0.16396587279977828,
            mean: 0.2455163748915879,
            median: 0.23279167647080445,
            variance: 0.0042198562705025085
        },
        AS: false,
        MT:
        {
            max: 0.6120157372907311,
            min: 0.12465043009047322,
            mean: 0.32491453127547354,
            median: 0.31648952362440463,
            variance: 0.009289489839362454
        },
        WV:
        {
            max: 0.5425215643401133,
            min: 0.11152819256226755,
            mean: 0.2606926680662944,
            median: 0.22903184496902138,
            variance: 0.011482458442629483
        },
        NH:
        {
            max: 0.7841696917445681,
            min: 0.1558985684823552,
            mean: 0.4615888337380826,
            median: 0.4645932188489821,
            variance: 0.021602010086424726
        },
        VI: false,
        NE: false,
        MN:
        {
            max: 0.6481763642434983,
            min: 0.1444078546088811,
            mean: 0.39880952894170074,
            median: 0.39944184046098097,
            variance: 0.012004909459057071
        },
        KY:
        {
            max: 0.6882993798977377,
            min: 0.08636382455689913,
            mean: 0.22200277271460492,
            median: 0.1998110772790604,
            variance: 0.011203033705576296
        },
        MI:
        {
            max: 0.7692659413445131,
            min: 0.06787508104437746,
            mean: 0.3845712479122428,
            median: 0.35876371603417384,
            variance: 0.020985637877331254
        },
        TX:
        {
            max: 0.6457140087568566,
            min: 0.062180384331374954,
            mean: 0.2586836371661248,
            median: 0.24824204550515408,
            variance: 0.013853734532471336
        },
        OR:
        {
            max: 0.5531238294287966,
            min: 0.10387170994223624,
            mean: 0.3113047382752728,
            median: 0.2969657216745924,
            variance: 0.008828514874639908
        },
        GA:
        {
            max: 0.5223177434943966,
            min: 0.09116756911296033,
            mean: 0.26951771091722926,
            median: 0.2561992864053782,
            variance: 0.008758647385404572
        },
        ID:
        {
            max: 0.711510953310648,
            min: 0.1959600195562136,
            mean: 0.40746425000711867,
            median: 0.41769590431663245,
            variance: 0.01921664148911843
        },
        LA:
        {
            max: 0.5291266022325025,
            min: 0.05001806768929829,
            mean: 0.2558705430024609,
            median: 0.2490184372466748,
            variance: 0.01021752634771151
        },
        HI:
        {
            max: 0.7316065152438,
            min: 0.08690861630409637,
            mean: 0.3790888412769254,
            median: 0.38133161246817615,
            variance: 0.020948882906257658
        },
        VA:
        {
            max: 0.5210367463710829,
            min: 0.07378788972310477,
            mean: 0.23140069587236284,
            median: 0.2093043263846297,
            variance: 0.007314192186424114
        },
        SD:
        {
            max: 0.746918620632513,
            min: 0.1165738368259092,
            mean: 0.39018287565970183,
            median: 0.3757521737077637,
            variance: 0.018210368556157312
        },
        PR:
        {
            max: 0.4723554218346781,
            min: 0.014949506562508834,
            mean: 0.25522920916901753,
            median: 0.23556161921452212,
            variance: 0.011280313068281103
        },
        CA:
        {
            max: 0.4991713509916762,
            min: 0.08877907671296967,
            mean: 0.2592114502217789,
            median: 0.249659599553198,
            variance: 0.007558839256385804
        },
        MS:
        {
            max: 0.6702361138113748,
            min: 0.07154475651790353,
            mean: 0.25826573254261403,
            median: 0.23361462165377656,
            variance: 0.013507319766572204
        },
        OH:
        {
            max: 0.7515095038150585,
            min: 0.0663030084671752,
            mean: 0.2677502573897435,
            median: 0.23070969489884124,
            variance: 0.02352572938072319
        },
        RI:
        {
            max: 0.6254298892478152,
            min: 0.18676558916754457,
            mean: 0.38763944075506873,
            median: 0.36844305780647224,
            variance: 0.013718273101173321
        },
        MO:
        {
            max: 0.7316245420941814,
            min: 0.16513175355203674,
            mean: 0.3767145503229931,
            median: 0.35540265555054246,
            variance: 0.012673235598772396
        },
        KS:
        {
            max: 0.7299551428614327,
            min: 0.18374063951736136,
            mean: 0.45282356759737985,
            median: 0.44170679972712457,
            variance: 0.0129992287547862
        },
        MD:
        {
            max: 0.39276165997648493,
            min: 0.0019855402075633377,
            mean: 0.17248931230626693,
            median: 0.17339113680787777,
            variance: 0.011575016297434368
        },
        NY:
        {
            max: 0.8063641116785416,
            min: 0.08529268710528504,
            mean: 0.30383926220063967,
            median: 0.28317140095063775,
            variance: 0.015185283680205193
        },
        NC:
        {
            max: 0.6628067856253828,
            min: 0.1332249086715862,
            mean: 0.3117541632735971,
            median: 0.3013376811455478,
            variance: 0.010047476292004337
        },
        AL:
        {
            max: 0.5008413070309037,
            min: 0.08274389155365254,
            mean: 0.23132396788159681,
            median: 0.22146967295586728,
            variance: 0.010138476602393299
        },
        GU: false,
        IN:
        {
            max: 0.6844178595404465,
            min: 0.1581198248246539,
            mean: 0.3574556467041582,
            median: 0.35019163885087723,
            variance: 0.010687266024758712
        },
        UT:
        {
            max: 0.5771076240618092,
            min: 0.15291915896879332,
            mean: 0.3399288704446046,
            median: 0.3359616554603785,
            variance: 0.0069516295729584445
        },
        CT:
        {
            max: 0.7773872708181913,
            min: 0.12129451328802845,
            mean: 0.3829677168571095,
            median: 0.3654100179456181,
            variance: 0.015420924066965642
        },
        OK:
        {
            max: 0.726171995700138,
            min: 0.1704306471601857,
            mean: 0.3949346818185175,
            median: 0.3599801411397805,
            variance: 0.017169658281606267
        },
        IA:
        {
            max: 0.6821018257307344,
            min: 0.07425047225701646,
            mean: 0.3596393996143901,
            median: 0.3593303935757509,
            variance: 0.017433065826322477
        },
        VT:
        {
            max: 0.7493477768798547,
            min: 0.15612316717613356,
            mean: 0.465125020587464,
            median: 0.47448584238619473,
            variance: 0.01802486108232484
        },
        WI:
        {
            max: 0.575025624375353,
            min: 0.04926203219819738,
            mean: 0.2662328223230634,
            median: 0.2620195112141953,
            variance: 0.01212922910517422
        },
        TN:
        {
            max: 0.49387227749147233,
            min: 0.0764271183901803,
            mean: 0.22866412610227627,
            median: 0.22389367358652282,
            variance: 0.00762232218383219
        },
        WY:
        {
            max: 0.6156160287747265,
            min: 0.1057798416656478,
            mean: 0.30638724323311867,
            median: 0.29991731386098147,
            variance: 0.013735227946985616
        },
        ND:
        {
            max: 0.713964586717254,
            min: 0.1939239860815729,
            mean: 0.397753400521363,
            median: 0.3739634987250355,
            variance: 0.016419734934395504
        },
        WA:
        {
            max: 0.6017155244809154,
            min: 0.11780743391052209,
            mean: 0.30756633563127894,
            median: 0.2822780034688453,
            variance: 0.009530812875299785
        },
        CO:
        {
            max: 0.6582381644540076,
            min: 0.09587207372535092,
            mean: 0.28217933234639586,
            median: 0.265337126526432,
            variance: 0.013394069651296164
        }
    };
    let sl_upper = {
        AZ:
        {
            max: 0.5392443683452036,
            min: 0.11209411135659558,
            mean: 0.29985252077942737,
            median: 0.28295570130975783,
            variance: 0.009744282039574758
        },
        SC:
        {
            max: 0.5253474760148745,
            min: 0.10055838694206339,
            mean: 0.27244885727177204,
            median: 0.2560905515510176,
            variance: 0.008184603540300851
        },
        MA:
        {
            max: 0.6930868933572788,
            min: 0.04795948762053741,
            mean: 0.30618824012785795,
            median: 0.27905511318412396,
            variance: 0.014162135479708526
        },
        AR:
        {
            max: 0.6348651912221112,
            min: 0.1041183260982768,
            mean: 0.26783652703513466,
            median: 0.2532480377178616,
            variance: 0.011315140287976259
        },
        MP: false,
        PA:
        {
            max: 0.7552462028054057,
            min: 0.06816551345131881,
            mean: 0.26945740902911935,
            median: 0.2466552706367729,
            variance: 0.012380090239877293
        },
        NM:
        {
            max: 0.5540475153063676,
            min: 0.10575741693173897,
            mean: 0.307149876469839,
            median: 0.3003149603575296,
            variance: 0.012223872462947425
        },
        ME:
        {
            max: 0.6454022056561982,
            min: 0.025374792554800383,
            mean: 0.3779496316137612,
            median: 0.3732252668622294,
            variance: 0.01394374575861356
        },
        NV:
        {
            max: 0.5925261568899478,
            min: 0.12491349099835007,
            mean: 0.3749474706131928,
            median: 0.365545569231826,
            variance: 0.012187540751792117
        },
        DC: false,
        IL:
        {
            max: 0.6196984281117189,
            min: 0.08547930633357392,
            mean: 0.2644964120557204,
            median: 0.25316026641101225,
            variance: 0.011110819735508669
        },
        DE:
        {
            max: 0.6698707937768869,
            min: 0.20653471899714884,
            mean: 0.41086984100251034,
            median: 0.36878536045794563,
            variance: 0.017135069795863034
        },
        FL:
        {
            max: 0.6860368969913093,
            min: 0.08184895691348007,
            mean: 0.42704891136060297,
            median: 0.4359376111829224,
            variance: 0.016825517701956564
        },
        AK:
        {
            max: 0.6501693786385161,
            min: 0.037260888407306514,
            mean: 0.311974130691328,
            median: 0.3148653292870418,
            variance: 0.018216891738533848
        },
        NJ:
        {
            max: 0.4196168823833186,
            min: 0.16396587279977828,
            mean: 0.2455163748915879,
            median: 0.23279167647080445,
            variance: 0.0042198562705025085
        },
        AS: false,
        MT:
        {
            max: 0.6120157372907311,
            min: 0.12465043009047322,
            mean: 0.32491453127547354,
            median: 0.31648952362440463,
            variance: 0.009289489839362454
        },
        WV:
        {
            max: 0.5425215643401133,
            min: 0.11152819256226755,
            mean: 0.2606926680662944,
            median: 0.22903184496902138,
            variance: 0.011482458442629483
        },
        NH:
        {
            max: 0.7841696917445681,
            min: 0.1558985684823552,
            mean: 0.4615888337380826,
            median: 0.4645932188489821,
            variance: 0.021602010086424726
        },
        VI: false,
        NE: false,
        MN:
        {
            max: 0.6481763642434983,
            min: 0.1444078546088811,
            mean: 0.39880952894170074,
            median: 0.39944184046098097,
            variance: 0.012004909459057071
        },
        KY:
        {
            max: 0.6882993798977377,
            min: 0.08636382455689913,
            mean: 0.22200277271460492,
            median: 0.1998110772790604,
            variance: 0.011203033705576296
        },
        MI:
        {
            max: 0.7692659413445131,
            min: 0.06787508104437746,
            mean: 0.3845712479122428,
            median: 0.35876371603417384,
            variance: 0.020985637877331254
        },
        TX:
        {
            max: 0.6457140087568566,
            min: 0.062180384331374954,
            mean: 0.2586836371661248,
            median: 0.24824204550515408,
            variance: 0.013853734532471336
        },
        OR:
        {
            max: 0.5531238294287966,
            min: 0.10387170994223624,
            mean: 0.3113047382752728,
            median: 0.2969657216745924,
            variance: 0.008828514874639908
        },
        GA:
        {
            max: 0.5223177434943966,
            min: 0.09116756911296033,
            mean: 0.26951771091722926,
            median: 0.2561992864053782,
            variance: 0.008758647385404572
        },
        ID:
        {
            max: 0.711510953310648,
            min: 0.1959600195562136,
            mean: 0.40746425000711867,
            median: 0.41769590431663245,
            variance: 0.01921664148911843
        },
        LA:
        {
            max: 0.5291266022325025,
            min: 0.05001806768929829,
            mean: 0.2558705430024609,
            median: 0.2490184372466748,
            variance: 0.01021752634771151
        },
        HI:
        {
            max: 0.7316065152438,
            min: 0.08690861630409637,
            mean: 0.3790888412769254,
            median: 0.38133161246817615,
            variance: 0.020948882906257658
        },
        VA:
        {
            max: 0.5210367463710829,
            min: 0.07378788972310477,
            mean: 0.23140069587236284,
            median: 0.2093043263846297,
            variance: 0.007314192186424114
        },
        SD:
        {
            max: 0.746918620632513,
            min: 0.1165738368259092,
            mean: 0.39018287565970183,
            median: 0.3757521737077637,
            variance: 0.018210368556157312
        },
        PR:
        {
            max: 0.4723554218346781,
            min: 0.014949506562508834,
            mean: 0.25522920916901753,
            median: 0.23556161921452212,
            variance: 0.011280313068281103
        },
        CA:
        {
            max: 0.4991713509916762,
            min: 0.08877907671296967,
            mean: 0.2592114502217789,
            median: 0.249659599553198,
            variance: 0.007558839256385804
        },
        MS:
        {
            max: 0.6702361138113748,
            min: 0.07154475651790353,
            mean: 0.25826573254261403,
            median: 0.23361462165377656,
            variance: 0.013507319766572204
        },
        OH:
        {
            max: 0.7515095038150585,
            min: 0.0663030084671752,
            mean: 0.2677502573897435,
            median: 0.23070969489884124,
            variance: 0.02352572938072319
        },
        RI:
        {
            max: 0.6254298892478152,
            min: 0.18676558916754457,
            mean: 0.38763944075506873,
            median: 0.36844305780647224,
            variance: 0.013718273101173321
        },
        MO:
        {
            max: 0.7316245420941814,
            min: 0.16513175355203674,
            mean: 0.3767145503229931,
            median: 0.35540265555054246,
            variance: 0.012673235598772396
        },
        KS:
        {
            max: 0.7299551428614327,
            min: 0.18374063951736136,
            mean: 0.45282356759737985,
            median: 0.44170679972712457,
            variance: 0.0129992287547862
        },
        MD:
        {
            max: 0.39276165997648493,
            min: 0.0019855402075633377,
            mean: 0.17248931230626693,
            median: 0.17339113680787777,
            variance: 0.011575016297434368
        },
        NY:
        {
            max: 0.8063641116785416,
            min: 0.08529268710528504,
            mean: 0.30383926220063967,
            median: 0.28317140095063775,
            variance: 0.015185283680205193
        },
        NC:
        {
            max: 0.6628067856253828,
            min: 0.1332249086715862,
            mean: 0.3117541632735971,
            median: 0.3013376811455478,
            variance: 0.010047476292004337
        },
        AL:
        {
            max: 0.5008413070309037,
            min: 0.08274389155365254,
            mean: 0.23132396788159681,
            median: 0.22146967295586728,
            variance: 0.010138476602393299
        },
        GU: false,
        IN:
        {
            max: 0.6844178595404465,
            min: 0.1581198248246539,
            mean: 0.3574556467041582,
            median: 0.35019163885087723,
            variance: 0.010687266024758712
        },
        UT:
        {
            max: 0.5771076240618092,
            min: 0.15291915896879332,
            mean: 0.3399288704446046,
            median: 0.3359616554603785,
            variance: 0.0069516295729584445
        },
        CT:
        {
            max: 0.7773872708181913,
            min: 0.12129451328802845,
            mean: 0.3829677168571095,
            median: 0.3654100179456181,
            variance: 0.015420924066965642
        },
        OK:
        {
            max: 0.726171995700138,
            min: 0.1704306471601857,
            mean: 0.3949346818185175,
            median: 0.3599801411397805,
            variance: 0.017169658281606267
        },
        IA:
        {
            max: 0.6821018257307344,
            min: 0.07425047225701646,
            mean: 0.3596393996143901,
            median: 0.3593303935757509,
            variance: 0.017433065826322477
        },
        VT:
        {
            max: 0.7493477768798547,
            min: 0.15612316717613356,
            mean: 0.465125020587464,
            median: 0.47448584238619473,
            variance: 0.01802486108232484
        },
        WI:
        {
            max: 0.575025624375353,
            min: 0.04926203219819738,
            mean: 0.2662328223230634,
            median: 0.2620195112141953,
            variance: 0.01212922910517422
        },
        TN:
        {
            max: 0.49387227749147233,
            min: 0.0764271183901803,
            mean: 0.22866412610227627,
            median: 0.22389367358652282,
            variance: 0.00762232218383219
        },
        WY:
        {
            max: 0.6156160287747265,
            min: 0.1057798416656478,
            mean: 0.30638724323311867,
            median: 0.29991731386098147,
            variance: 0.013735227946985616
        },
        ND:
        {
            max: 0.713964586717254,
            min: 0.1939239860815729,
            mean: 0.397753400521363,
            median: 0.3739634987250355,
            variance: 0.016419734934395504
        },
        WA:
        {
            max: 0.6017155244809154,
            min: 0.11780743391052209,
            mean: 0.30756633563127894,
            median: 0.2822780034688453,
            variance: 0.009530812875299785
        },
        CO:
        {
            max: 0.6582381644540076,
            min: 0.09587207372535092,
            mean: 0.28217933234639586,
            median: 0.265337126526432,
            variance: 0.013394069651296164
        }
    };
    switch(districts) {
        case "Congress": 
            return cong[state_name_to_postal[st]];
        case "State Senate":
            return sl_upper[state_name_to_postal[st]];
        case "State House":
        case "State Assembly":
        case "House of Delegates":
            return sl_lower[state_name_to_postal[st]];
    }
    return false;
}
