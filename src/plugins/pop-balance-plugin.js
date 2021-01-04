import { html } from "lit-html";
import { Tab } from "../components/Tab";
import { spatial_abilities } from "../utils";
import HighlightUnassigned from "../components/Charts/HighlightUnassigned";
import MultiMemberPopBalanceChart from "../components/Charts/MMPopBalanceChart";
import populationBarChart from "../components/Charts/PopulationBarChart";
import populationDeviation from "../components/Charts/PopulationDeviation";
import unassignedPopulation from "../components/Charts/UnassignedPopulation";

export default function PopulationBalancePlugin(editor) {
    const problem = editor.state.plan.problem;
    const state = editor.state;
    const showVRA = (state.plan.problem.type !== "community") && (spatial_abilities(state.place.id).vra_effectiveness);
    const tab = new Tab("criteria", showVRA ? "Pop" : "Population", editor.store);

    if (problem.type === "multimember") {
        tab.addRevealSection(
            "Population Balance",
            () => html`
                ${MultiMemberPopBalanceChart(state.population, state.parts)}
                <dl class="report-data-list">
                    ${unassignedPopulation(state.population)}
                    ${HighlightUnassigned(state.unitsBorders)}
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
                        ${HighlightUnassigned(state.unitsBorders)}
                    </dl>
                `
        );
    }
    editor.toolbar.addTab(tab);
}
