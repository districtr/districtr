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
            spatial_abilities(state.place.id).nonvap ? "Under 18 - Balance" : "Population Balance",
            () =>
                html`
                    ${populationBarChart(
                       state.population,
                       state.activeParts,
                       spatial_abilities(state.place.id).nonvap ? state.vap : null
                    )}
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
