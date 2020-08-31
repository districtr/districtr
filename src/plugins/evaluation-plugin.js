import ElectionResultsSection from "../components/Charts/ElectionResultsSection";
import RacialBalanceTable from "../components/Charts/RacialBalanceTable";
import AgeHistogramTable from "../components/Charts/AgeHistogramTable";
import ContiguitySection from "../components/Charts/ContiguitySection";
import { Tab } from "../components/Tab";
import { CoalitionPivotTable } from "../components/Charts/CoalitionPivotTable";
import { spatial_abilities } from "../utils";

export default function EvaluationPlugin(editor) {
    const { state, toolbar } = editor;

    const tab = new Tab("evaluation", "Evaluation", editor.store);

    if (state.population.subgroups.length > 1) {
        tab.addRevealSection(
            "Population by Race",
            (uiState, dispatch) =>
                RacialBalanceTable(
                    "Population by Race",
                    state.population,
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
        if (spatial_abilities(state.place.id).nonvap) {
            tab.addRevealSection(
                "Children Ages 0-17 by Race",
                (uiState, dispatch) =>
                    RacialBalanceTable(
                        "Children Ages 0-17 by Race",
                        state.vap,
                        state.activeParts,
                        uiState.charts["Children Ages 0-17 by Race"],
                        dispatch,
                        state.population // nonvap
                    ),
                {
                    isOpen: state.population.subgroups.length > 1 ? false : true,
                    activeSubgroupIndices: state.vap.indicesOfMajorSubgroups()
                }
            );
        } else {
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
            (uiState, dispatch) =>
                ElectionResultsSection(
                    state.elections,
                    state.activeParts,
                    uiState,
                    dispatch
                ),
            {
                isOpen:
                    state.population.subgroups.length <= 1 &&
                    state.vap === undefined
                        ? true
                        : false
            }
        );
    }

    if (spatial_abilities(state.place.id).coalition) {
        const coalitionPivot = CoalitionPivotTable(
            "Coalition Builder",
            state.population,
            state.place.name,
            state.parts,
            state.units,
            false, // single total
            true // districts
        );
        tab.addRevealSection("Coalition Builder", coalitionPivot, {
            isOpen: true,
            activePartIndex: 0
        });
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
}
