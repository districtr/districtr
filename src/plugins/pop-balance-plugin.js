
import { html } from "lit-html";
import { Tab } from "../components/Tab";
import { spatial_abilities, specialStates } from "../utils";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import populateDatasetInfo from "../components/Charts/DatasetInfo";

export default function PopulationBalancePlugin(editor) {
    const problem = editor.state.plan.problem;
    const state = editor.state;
    const showVRA = (state.plan.problem.type !== "community") && (spatial_abilities(state.place.id).vra_effectiveness);
    const tab = new Tab("criteria", showVRA ? "Pop." : "Population", editor.store);

    let place = editor.state.place.id,
        extra_source = (editor.state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0;
    if (editor.state.units.sourceId === "ma_towns") {
        extra_source = "ma_towns";
    }
    if (editor.state.units.sourceId === "indiana_precincts") {
        extra_source = "indianaprec";
    }
    const placeID = extra_source || place;
    const sep = (placeID === "louisiana") ? ";" : ",";

    const unassignedZoom = (e) => {
      const units = state.unitsRecord.id;

      const stateName = specialStates(state.place.id);
      const paint_ids = Object.keys(state.plan.assignment).filter(k => {
          return (typeof state.plan.assignment[k] === 'object')
            ? state.plan.assignment[k][0] || (state.plan.assignment[k][0] === 0)
            : state.plan.assignment || (state.plan.assignment === 0)
      });
      fetch("https://gvd4917837.execute-api.us-east-1.amazonaws.com/unassigned", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          "state": stateName,
          "units": units,
          "assignment": paint_ids})
      }).then((res) => res.json())
        .catch((e) => console.error(e))
        .then((data) => {
          if (data["unassigned_units"]) {
            data = data["unassigned_units"];
          }
          const awsBox = data && data.length == 4;
          if (awsBox) {
              if (data[0] === data[2]) {
                  data[0] -= 0.05;
                  data[1] -= 0.05;
                  data[2] += 0.05;
                  data[3] += 0.05;
              } else {
                  const lngdiff = data[2] - data[0],
                        latdiff = data[3] - data[1];
                  data[0] -= 0.1 * lngdiff;
                  data[1] -= 0.1 * latdiff;
                  data[2] += 0.1 * lngdiff;
                  data[3] += 0.1 * latdiff;
              }
              editor.state.map.fitBounds([
                // lngmin, latmin
                // lngmax, latmax
                [data[0], data[1]],
                [data[2], data[3]]
              ]);
              return;
          }
          const myurl = `//mggg.pythonanywhere.com/findBBox?place=${placeID}&`;
          fetch(`${myurl}ids=${ids.slice(0, 100).join(sep)}`).then(res => res.json()).then((bbox) => {
            if (! bbox[0].includes(null)) {
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
            };
          });
        });
    };

    const zoomToUnassigned = (state.unitsRecord.id === "blockgroups" || state.unitsRecord.id === "blockgroups20"
                              || spatial_abilities(editor.state.place.id).portal
                              || spatial_abilities(editor.state.place.id).find_unpainted
                              || state.unitsRecord.id === "vtds20")
                                ? unassignedZoom : null;


    if (problem.type === "multimember") {
        tab.addRevealSection(
            "Population Balance",
            () => html`
                <section class="toolbar-inner dataset-info">
                    ${populateDatasetInfo(state)}
                </section>
                ${MultiMemberPopBalanceChart(state.population, state.parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(state.population)}
                    ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                </dl>
            `
        );
    } else {
        tab.addRevealSection(
            "Population Balance",
            () =>
                html`
                    <section class="toolbar-inner dataset-info">
                        ${populateDatasetInfo(state)}
                    </section>
                    ${populationBarChart(state.population, state.activeParts)}
                    <dl class="report-data-list">
                        ${unassignedPopulation(state.population)}
                        ${populationDeviation(state.population)}
                        ${HighlightUnassigned(state.unitsBorders, zoomToUnassigned)}
                    </dl>
                `
        );
    }

    // Add the tab to the toolbar.
    editor.toolbar.addTab(tab);
}
