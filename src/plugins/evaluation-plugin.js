import { html } from "lit-html";
import ElectionResultsSection from "../components/Charts/ElectionResultsSection";
import RacialBalanceTable from "../components/Charts/RacialBalanceTable";
import AgeHistogramTable from "../components/Charts/AgeHistogramTable";
import ContiguitySection from "../components/Charts/ContiguitySection";
import VRAEffectivenessTable from "../components/Charts/VRATable";
import { Tab } from "../components/Tab";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";
import { spatial_abilities } from "../utils";

export default function EvaluationPlugin(editor) {
    const { state, toolbar } = editor;

    const tab = new Tab("evaluation", "Evaluation", editor.store);

    if (state.population.subgroups.length > 1) {
        let mockColumnSet = state.population;
        if (spatial_abilities(state.place.id).coalition) {
            let coalitionSubgroup = {
                data: [],
                key: 'coal',
                name: "Coalition population",
                getAbbreviation: () => "Coalition",
                getFractionInPart: function (p) {
                    let fullsum = 0,
                        selectSGs = state.population.subgroups.filter(sg => window.coalitionGroups[sg.key]);
                    selectSGs.forEach(sg => {
                        fullsum += sg.sum;
                        sg.data.forEach((val, idx) => this.data[idx] = (this.data[idx] || 0) + val);
                    });
                    this.sum = fullsum;
                    let portion = 0;
                    selectSGs.forEach((selected) => {
                        portion += selected.getFractionInPart(p);
                    });
                    return portion;
                },
                sum: 0,
                total: mockColumnSet.subgroups[0].total
            };
            mockColumnSet = {
                ...mockColumnSet,
                subgroups: [].concat(mockColumnSet.subgroups.filter(x => x.total !== mockColumnSet.total_alt)).concat([coalitionSubgroup])
            };
        }

        tab.addRevealSection(
            "Population by Race",
            (uiState, dispatch) =>
                RacialBalanceTable(
                    "Population by Race",
                    mockColumnSet,
                    state.activeParts,
                    uiState.charts["Population by Race"],
                    dispatch
                ),
            {
                isOpen: true,
                activeSubgroupIndices: state.population.indicesOfMajorSubgroups()
            }
        );
    }
    if (state.vap) {
        tab.addRevealSection(
            "Voting Age Population by Race",
            (uiState, dispatch) =>
                RacialBalanceTable(
                    "Voting Age Population by Race",
                    state.vap,
                    state.activeParts,
                    uiState.charts["Voting Age Population by Race"],
                    dispatch
                ),
            {
                isOpen: state.population.subgroups.length > 1 ? false : true,
                activeSubgroupIndices: state.vap.indicesOfMajorSubgroups()
            }
        );
    }
    if (state.ages) {
        tab.addRevealSection(
            "Age Histograms",
            (uiState, dispatch) =>
                AgeHistogramTable(
                    "Age Histograms",
                    state.ages,
                    state.activeParts,
                    uiState.charts["Age Histograms"],
                    dispatch
                ),
            {
                isOpen: false
            }
        );
    }
    if (state.elections.length > 0) {
        tab.addRevealSection(
            "Partisan Balance",
            (uiState, dispatch) => html`
                ${spatial_abilities(state.place.id).absentee
                    ? html`<div style="text-align:center">Election results include absentee votes</div>`
                    : null
                }
                ${ElectionResultsSection(
                    state.elections,
                    state.activeParts,
                    uiState,
                    dispatch
                )}`,
            {
                isOpen:
                    state.population.subgroups.length <= 1 &&
                    state.vap === undefined
                        ? true
                        : false
            }
        );
    }

    if (state.plan.problem.type !== "community"
        && (spatial_abilities(state.place.id).contiguity)
        && (state.units.sourceId !== "ma_towns")
    ) {
        tab.addRevealSection(
            "Contiguity",
            (uiState, dispatch) =>
                ContiguitySection(
                    state.parts,
                    state.contiguity,
                    spatial_abilities(state.place.id).contiguity,
                    uiState,
                    dispatch
                ),
            {
                isOpen: true
            }
        );
    }

    if (tab.sections.length > 0) {
        toolbar.addTab(tab);
    }

    if (state.plan.problem.type !== "community"
        && (spatial_abilities(state.place.id).vra_effectiveness)
        && (state.units.sourceId !== "ma_towns")
    ) {
        tab.addRevealSection(
            "VRA Effectiveness",
            (uiState, dispatch) =>
                VRAEffectivenessTable(
                    state.parts,
                    state.vra_effectiveness,
                    uiState,
                    dispatch
                ),
            {
                isOpen: false
            }
        );
    }
}
