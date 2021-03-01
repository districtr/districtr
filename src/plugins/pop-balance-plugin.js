import { html, directive } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import { spatial_abilities } from "../utils";


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
            census: "You are balancing population using statistics from the " +
                "<strong>2010 United States Census</strong>. Most states require the use of " +
                "data from the most recent decennial Census in their redistricting " +
                "processes. Constitutionally mandated to be conducted every ten " +
                "years, this dataset is extremely broad, with more than  This data is " +
                "available at the <strong>Census block " +
                "</strong> level, and has been aggregated from the block level to " +
                place.name + "'s " + units.unitType + ".",
            acs: "You are balancing population using statistics from the " +
                "<strong>American Community Survey five-year estimates</strong>. " +
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
    
    if (place.name.toLowerCase() === "wisconsin" || population.name !== "Population") {
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
function populateDatasetInfo(state) {
    return directive(promise => _ => {
        Promise.resolve(promise).then(__ => {
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

export default function PopulationBalancePlugin(editor) {
    const problem = editor.state.plan.problem;
    const state = editor.state;
    const tab = new Tab("criteria", "Population", editor.store);
    
    let plan = editor.state.plan,
        place = editor.state.place.id,
        extra_source = (editor.state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0;
    if (editor.state.units.sourceId === "ma_towns") {
        extra_source = "ma_towns";
    }
    if (editor.state.units.sourceId === "indiana_precincts") {
        extra_source = "indianaprec";
    }
    const placeID = extra_source || place;
    const sep = (placeID === "louisiana") ? ";" : ",";

    const zoomToUnassigned = spatial_abilities(editor.state.place.id).find_unpainted
      ? (e) => {
        let saveplan = state.serialize();
        const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
        fetch(GERRYCHAIN_URL + "/unassigned", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(saveplan),
        })
        .then((res) => res.json())
        .catch((e) => console.error(e))
        .then((data) => {
          if (data["-1"] && data["-1"].length) {
            const ids = data["-1"].filter(a => !a.includes(null)).sort((a, b) => b.length - a.length)[0];
            const myurl = `//mggg.pythonanywhere.com/findBBox?place=${placeID}&`;
              // : `https://mggg-states.subzero.cloud/rest/rpc/bbox_${placeID}?`
            fetch(`${myurl}ids=${ids.slice(0, 100).join(sep)}`).then(res => res.json()).then((bbox) => {
              if (bbox.length && typeof bbox[0] === 'number') {
                bbox = {x: bbox};
              } else if (bbox.length) {
                bbox = bbox[0];
                if (bbox.length) {
                  bbox = {x: bbox};
                }
              }
              Object.values(bbox).forEach(mybbox => {
                editor.state.map.fitBounds([
                  [mybbox[0], mybbox[2]],
                  [mybbox[1], mybbox[3]]
                ]);
              });
            });
          }
        });
      }
      : null;

    if (problem.type === "multimember") {
        tab.addRevealSection(
            "Population Balance",
            () => html`
                ${MultiMemberPopBalanceChart(state.population, state.parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(state.population)}
                    ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                </dl>
                <section class="toolbar-inner dataset-info"></section>
            `
        );
    } else {
        tab.addRevealSection(
            "Population Balance",
            () =>
                html`
                    ${populationBarChart(state.population, state.activeParts)}
                    <dl class="report-data-list">
                        ${unassignedPopulation(state.population)}
                        ${populationDeviation(state.population)}
                        ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                    </dl>
                    <section class="toolbar-inner dataset-info">
                        ${populateDatasetInfo(state)}
                    </section>
                `
        );
    }
    
    // Add the tab to the toolbar.
    editor.toolbar.addTab(tab);
}
