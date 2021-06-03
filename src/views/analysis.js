
import { html, render } from "lit-html";
import DisplayPane from "../components/DisplayPane";
import Button from "../components/Button";
import { renderModal, closeModal } from "../components/Modal";
import { loadPlanFromURL } from "../routes";
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



/**
 * @desc Retrieves a test plan if we're doing dev work, the real deal if we
 * aren't.
 * @param {String} url URL from which we load the plan.
 * @returns {Promise}
 */
function loadPlan(url) {
    if (_isDev()) return loadPlanFromURL("/assets/mi-plans/congress.json");
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
                // new Slide(overview_slide(state, data.contiguity, data.split), "Overview"),
                // overview (show 1)
                new Slide(election_slide(state), "Election Results"),
                // compactness (cut edges, polsby popper)
                new Slide(compactness_slide(state, data.cut_edges), "Compactness")
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
function userOnGo(left) {
    // Create a function that does the proper thing when loading.
    return e => {
        // Get the URL, JSON file, or enacted plan provided by the user.
        // TODO do the last two things.
        let url = document.getElementById("shareable-url").value,
            plan = loadPlan(url);
    
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
    let go = new Button(userOnGo(left), { label: "Go.", hoverText: "Evaluate the selected plan." }),
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
                </div>
                <div class="modal-item" id="upload">
                    <h3>Upload</h3>
                    <p>
                        Upload a Districtr JSON or CSV file from your computer.
                    </p>
                </div>
                <div class="modal-item" id="enacted">
                    <h3>Enacted</h3>
                    <p>
                        Analyze an enacted districting plan.
                    </p>
                </div>
            </div>
            <div class="modal-bottom-bar">
                <div class="bottom-bar">${go}</div>
            </div>
        `,
        modal = renderModal(template);
    
    // Render inner content.
    render(modal, target);
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
    if (state.plan.problem.pluralNoun.includes("Congressional Districts")) {
        headers = ["Your Plan", "Enacted Plan"];
        let enacted = cong_polsby_popper(state.place.name);
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
        else if (mean_diff > 0.5)
            comparison = "slightly less compact than"
        else if (mean_diff > -0.5)
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
        must take care to choose a proper map projection. Ours are calculated in PROJ TODO. A higher
        Polsby Popper score means a more compact district.<br/><br/>
        According to Polsby Popper scores, your average district is 
        <strong>${comparison}</strong> the average enacted district.
        <div>
        ${polsbypopper_table}
        `;
}

// County Splits slide
function county_slide(state) {

}

/** LOOKUP FUNCTIONS */
function cong_polsby_popper(st) {
    let scores = {
        CT:
        {
            max: 0.4396800786973772,
            min: 0.1757496474754079,
            mean: 0.27257163358251413,
            median: 0.2257907320082957,
            variance: 0.011882525506876837
        },
        IL:
        {
            max: 0.35616969579227936,
            min: 0.05416097921772665,
            mean: 0.1662113460214458,
            median: 0.16566335865603127,
            variance: 0.005277183640164762
        },
        IA:
        {
            max: 0.4849835574969534,
            min: 0.2929180403218393,
            mean: 0.3877423876318242,
            median: 0.38653397635425213,
            variance: 0.0073431202326513295
        },
        WI:
        {
            max: 0.43275629995809534,
            min: 0.16687417431242985,
            mean: 0.29302216558306304,
            median: 0.27793605770577207,
            variance: 0.006706635504991761
        },
        NC:
        {
            max: 0.2304174813450609,
            min: 0.02946488437841575,
            mean: 0.12000066306378769,
            median: 0.10847893673366124,
            variance: 0.0049402803885725145
        },
        RI:
        {
            max: 0.3067368376884244,
            min: 0.2636304058154321,
            mean: 0.28518362175192824,
            median: 0.28518362175192824,
            variance: 0.0009290822344104627
        },
        CA:
        {
            max: 0.4490826648213046,
            min: 0.08776950429377486,
            mean: 0.23668563235516554,
            median: 0.2222022081252617,
            variance: 0.005772653551136025
        },
        NV:
        {
            max: 0.5807945885802938,
            min: 0.4134394433102993,
            mean: 0.5227834494371124,
            median: 0.5484498829289283,
            variance: 0.006204087957039695
        },
        MO:
        {
            max: 0.4507331260836655,
            min: 0.1943823934206597,
            mean: 0.26960861697842897,
            median: 0.23377241680344205,
            variance: 0.007843317084269828
        },
        KY:
        {
            max: 0.36720588190563996,
            min: 0.11601583564608055,
            mean: 0.19124143816370623,
            median: 0.14858932932213606,
            variance: 0.00947604021246773
        },
        NH:
        {
            max: 0.17408814927403365,
            min: 0.1530880413908175,
            mean: 0.16358809533242558,
            median: 0.16358809533242558,
            variance: 0.00022050226555335868
        },
        HI:
        {
            max: 0.3946597142131837,
            min: 0.06711501282103345,
            mean: 0.23088736351710856,
            median: 0.23088736351710856,
            variance: 0.05364276570503643
        },
        KS:
        {
            max: 0.4573234497892959,
            min: 0.34979606880779945,
            mean: 0.4085820194607137,
            median: 0.41360427962287977,
            variance: 0.0020306978170317844
        },
        NE:
        {
            max: 0.4444442011926598,
            min: 0.3257395391811613,
            mean: 0.3828109917854439,
            median: 0.3782492349825107,
            variance: 0.0035383064146628567
        },
        WY:
        {
            max: 0.7719522159343508,
            min: 0.7719522159343508,
            mean: 0.7719522159343508,
            median: 0.7719522159343508,
        },
        MI:
        {
            max: 0.5554042591648894,
            min: 0.1035690383488941,
            mean: 0.2984573395296432,
            median: 0.27173960247193407,
            variance: 0.018011001946981835
        },
        AL:
        {
            max: 0.27530746866944944,
            min: 0.1313092176776689,
            mean: 0.1902511079469073,
            median: 0.179185255726042,
            variance: 0.0027600390363386475
        },
        ID:
        {
            max: 0.321901890233675,
            min: 0.1865279790071165,
            mean: 0.25421493462039574,
            median: 0.25421493462039574,
            variance: 0.009163047920388068
        },
        TX:
        {
            max: 0.5646075964644651,
            min: 0.04495547645151882,
            mean: 0.19741900122033595,
            median: 0.181081053754804,
            variance: 0.012520278156976162
        },
        PA:
        {
            max: 0.3959692585434813,
            min: 0.04099712064002877,
            mean: 0.17052623481560192,
            median: 0.1362894295234517,
            variance: 0.012527688006750984
        },
        MN:
        {
            max: 0.5652553600957361,
            min: 0.2203128763908328,
            mean: 0.330598745901997,
            median: 0.3232321822533102,
            variance: 0.011721242822386232
        },
        SC:
        {
            max: 0.33227998628750305,
            min: 0.08061874741028886,
            mean: 0.20830455391425678,
            median: 0.21246680338660487,
            variance: 0.009369501752126794
        },
        WA:
        {
            max: 0.4808102528761759,
            min: 0.15851947785352047,
            mean: 0.27836249275641284,
            median: 0.24303792632756682,
            variance: 0.009815576682382823
        },
        MS:
        {
            max: 0.4023090003493832,
            min: 0.14878896141813353,
            mean: 0.26365915149412733,
            median: 0.25176932210449626,
            variance: 0.016182340379584128
        },
        OK:
        {
            max: 0.2694814131350089,
            min: 0.20610627634110606,
            mean: 0.25080502668061844,
            median: 0.26218217613285216,
            variance: 0.0006841962104453655
        },
        MT:
        {
            max: 0.4812586005765291,
            min: 0.4812586005765291,
            mean: 0.4812586005765291,
            median: 0.4812586005765291,
        },
        OH:
        {
            max: 0.3887398819595633,
            min: 0.05645507302033621,
            mean: 0.18866032191317644,
            median: 0.14892201432690158,
            variance: 0.009157866434404801
        },
        WV:
        {
            max: 0.17915404580779273,
            min: 0.0952652731068404,
            mean: 0.13798807244951627,
            median: 0.13954489843391565,
            variance: 0.0017611493266772873
        },
        NM:
        {
            max: 0.4029309999744631,
            min: 0.2650662390420385,
            mean: 0.3493116256283196,
            median: 0.3799376378684571,
            variance: 0.005455137546038435
        },
        MA:
        {
            max: 0.3841125636116937,
            min: 0.07597076935009615,
            mean: 0.22532616941731623,
            median: 0.2274108806599097,
            variance: 0.009555579932164961
        },
        DE:
        {
            max: 0.4588425198597865,
            min: 0.4588425198597865,
            mean: 0.4588425198597865,
            median: 0.4588425198597865,
        },
        GA:
        {
            max: 0.3678757074407877,
            min: 0.15743661104063875,
            mean: 0.2603332290488103,
            median: 0.2741148992699365,
            variance: 0.0035861340073846527
        },
        NJ:
        {
            max: 0.34904997515833264,
            min: 0.10103327689631847,
            mean: 0.19818084159325458,
            median: 0.20002656094239174,
            variance: 0.004356690904028211
        },
        VA:
        {
            max: 0.26106289984936193,
            min: 0.08284755579748371,
            mean: 0.16175456970835544,
            median: 0.16332960711536434,
            variance: 0.00273244230721966
        },
        AK:
        {
            max: 0.06470494648209002,
            min: 0.06470494648209002,
            mean: 0.06470494648209002,
            median: 0.06470494648209002,
        },
        ME:
        {
            max: 0.29074636999690323,
            min: 0.17326722524301102,
            mean: 0.23200679761995713,
            median: 0.23200679761995713,
            variance: 0.00690067472605298
        },
        VT:
        {
            max: 0.3666341551463648,
            min: 0.3666341551463648,
            mean: 0.3666341551463648,
            median: 0.3666341551463648,
        },
        OR:
        {
            max: 0.4878317362184752,
            min: 0.1469729552000325,
            mean: 0.31202430797129144,
            median: 0.2809255752452832,
            variance: 0.01814595305774624
        },
        UT:
        {
            max: 0.3659576561748479,
            min: 0.2056030188740632,
            mean: 0.2769875112171494,
            median: 0.2681946849098433,
            variance: 0.0047777846117864654
        },
        MD:
        {
            max: 0.31185390351496056,
            min: 0.03282216451873772,
            mean: 0.11377773395972261,
            median: 0.08571240863026354,
            variance: 0.007712278788111063
        },
        FL:
        {
            max: 0.4735537447524541,
            min: 0.03864965986764753,
            mean: 0.2993853150934431,
            median: 0.30344214383273466,
            variance: 0.012164375945060295
        },
        TN:
        {
            max: 0.2931493691537371,
            min: 0.11163072031112163,
            mean: 0.2023424229785099,
            median: 0.2264842032779072,
            variance: 0.004203901735583913
        },
        ND:
        {
            max: 0.5142188548837111,
            min: 0.5142188548837111,
            mean: 0.5142188548837111,
            median: 0.5142188548837111,
        },
        IN:
        {
            max: 0.5787700589359356,
            min: 0.2104560791147964,
            mean: 0.43164587215408123,
            median: 0.4674157589955608,
            variance: 0.012450864965717776
        },
        NY:
        {
            max: 0.5408543979635086,
            min: 0.09454216816367833,
            mean: 0.3482527834243371,
            median: 0.3444302200617064,
            variance: 0.014554424683275537
        },
        AR:
        {
            max: 0.2824290656778781,
            min: 0.12958976824394486,
            mean: 0.19922751109897674,
            median: 0.19244560523704202,
            variance: 0.005767373454259063
        },
        SD:
        {
            max: 0.5577493202300144,
            min: 0.5577493202300144,
            mean: 0.5577493202300144,
            median: 0.5577493202300144,
        },
        AZ:
        {
            max: 0.5197538560342571,
            min: 0.12118284792608194,
            mean: 0.29887890376455645,
            median: 0.2604297850724577,
            variance: 0.021529945755867613
        },
        CO:
        {
            max: 0.39967307565609095,
            min: 0.09844119038796073,
            mean: 0.24475574281731838,
            median: 0.2261677232560777,
            variance: 0.016540917228440147
        },
        LA:
        {
            max: 0.31605801229537805,
            min: 0.056584999578736236,
            mean: 0.1445639770840502,
            median: 0.12938868457597294,
            variance: 0.008943718884240958
        }
    };
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
    return scores[state_name_to_postal[st]];
}
