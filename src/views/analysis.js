
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
    if (_isDev() && url == "") 
        return loadPlanFromURL("/assets/mi-plans/state_house.json");
    let districtr_id = url.split('/')[url.split('/').length - 1];
    return fetch('https://districtr.org/.netlify/functions/planRead?id=' + districtr_id)
    .then(res => res.json())
    .then(loadPlanFromJSON);
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
    fetch(GERRYCHAIN_URL + "/eval_page", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveplan),
    }).then((res) => res.json())
      .catch((e) => console.error(e))
      .then((data) => {
            console.log(state);
            console.log(data);
            // Create the charts for the Slides.
            let slides = [
                // overview (show 1st)
                new Slide(overview_slide(state, data.contiguity, data.split), "Overview"),
                // election results slide
                new Slide(election_slide(state), "Election Results"),
                // compactness (cut edges, polsby popper)
                new Slide(compactness_slide(state, data.cut_edges, data.polsbypopper), "Compactness")
                // TODO counties split and county splits
                
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
        // TODO do the last thing.
        let url = document.getElementById("shareable-url").value;
        let plan = loadPlan(url);
    
        // Disable the Go button.
        e.target.disabled = true;
        
        plan.then(context => {
            renderLeft(left, context);
            // right gets rendered within the left pane render,
            // since we need the mapstate first          
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
    let contig_section = 
        problems 
        ? html`<h4 id="contiguity-status">
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
        : html`<h4 id="contiguity-status">
                Contiguity status not available for ${state.place.name}.
            </h4>`
    
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
    console.log(state.elections);
    if (state.elections.length < 1)
        return html`No election data available for ${state.place.name}.`
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
        let d_seat_share = d_seats/election.total.data.length;
        let bias_to = (d_votes > d_seat_share) ? "R" : "D";
        console.log(d_seats);


        // > 0 if biased towards Rs, < 0 if toward Ds
        let bias_by = Math.round(((d_votes - d_seat_share) * election.total.data.length) * 10)/10;
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
        ${bias_acc.length} ${elections.length > 1 ? html`elections, with a variance of ${var_bias}.`
        : html`election.`}
        <br/>
        ${elections[0].parties.length === 2 ? html`<strong>two-way vote share</strong>` : ""}
        ${DataTable(headers, rows)}
        `;
}

// Compactness slide (cut edges, polsby popper)
function compactness_slide(state, cut_edges, plan_scores) {
    // Polsby Popper Scores
    // place holders, I c/p'd them from CT
    let tmp_plan_scores = {
        max: 0.4396800786973772,
        min: 0.1757496474754079,
        mean: 0.27257163358251413,
        median: 0.2257907320082957,
        variance: 0.011882525506876837
    };
    //let plan = plan_scores;
    let columns = ["Max", "Min", "Mean", "Median", "Variance"]
    let rows = [], headers, comparison;
    let enacted = polsby_popper(state.place.name, state.plan.problem.name);
    if (enacted) {
        headers = ["Your Plan (TMP)", "Enacted Plan"];
        for (let c of columns) {
            rows.push({
                label: c,
                entries: [
                    {content: roundToDecimal(plan_scores[c.toLowerCase()], 3)},
                    {content: roundToDecimal(enacted[c.toLowerCase()], 3)}
            ]})
        }
        let mean_diff = enacted.mean - plan_scores.mean;
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
        headers = ["Your Plan (TMP)"];
        for (let c of columns) {
            rows.push({
                label: c,
                entries: [
                    {content: roundToDecimal(plan_scores[c.toLowerCase()], 3)},
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
        ${cut_edges > 0 ?
        html`Your plan has <strong>${cut_edges}</strong> cut edges.`
        : html`Cut Edges count not available for ${state.place.name}`}
        </div>
        <br/>        
        <h3>Polsby Popper Scores</h3>
        <div style='text-align: left'>
        Another measure of compactness is the <strong>Polsby Popper score</strong>, which is a ratio
        of the area of a district to it's perimeter. When calculating Polsby Popper scores, one
        must take care to choose a proper map projection. Ours are calculated in the appropriate UTM projection
        for each state (for more info, consult the <a href="https://gerrychain.readthedocs.io/en/latest/api.html">GerryChain documentation</a>). 
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
