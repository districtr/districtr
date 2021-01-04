import { html } from "lit-html";
import { Tab } from "../components/Tab";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";
import { spatial_abilities } from "../utils";

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
    const placeID = extra_source || place;
    const sep = (placeID === "louisiana") ? ";" : ",";

    const zoomToUnassigned = spatial_abilities(editor.state.place.id).contiguity
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
            const ids = data["-1"].sort((a, b) => b.length - a.length)[0];
            fetch(`https://mggg-states.subzero.cloud/rest/rpc/merged_${placeID}?ids=${ids.join(sep)}`).then(res => res.json()).then((centroid) => {
              centroid = centroid.replace('POINT', '').replace('(', '').replace(')', '').trim().split(" ").map(n => Number(n));
              editor.state.map.flyTo({
                center: centroid,
                zoom: 14
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
                `
        );
    }
    editor.toolbar.addTab(tab);
}
