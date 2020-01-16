import ElectionResultsSection from "../components/Charts/ElectionResultsSection";
import RacialBalanceTable from "../components/Charts/RacialBalanceTable";
import { Tab } from "../components/Tab";

import spanish from "../l10n/es";
const i18n = spanish.spanish;

export default function EvaluationPlugin(editor) {
    const { state, toolbar } = editor;

    const tab = new Tab("evaluation", i18n.editor.evaluation.evaluation, editor.store);

    if (state.population.subgroups.length > 1) {
        let label = i18n.editor.evaluation.balance.replace("VARIABLE", i18n.editor.evaluation.racial);
        tab.addRevealSection(
            label,
            (uiState, dispatch) =>
                RacialBalanceTable(
                    label,
                    state.population,
                    state.activeParts,
                    uiState.charts[label],
                    dispatch
                ),
            {
                isOpen: true,
                activeSubgroupIndices: state.population.indicesOfMajorSubgroups()
            }
        );
    }
    if (state.vap) {
        let label = i18n.editor.evaluation.balance.replace("VARIABLE", i18n.editor.evaluation.vap);
        tab.addRevealSection(
            label,
            (uiState, dispatch) =>
                RacialBalanceTable(
                    label,
                    state.vap,
                    state.activeParts,
                    uiState.charts[label],
                    dispatch
                ),
            {
                isOpen: state.population.subgroups.length > 1 ? false : true,
                activeSubgroupIndices: state.vap.indicesOfMajorSubgroups()
            }
        );
    }
    if (state.elections.length > 0) {
        tab.addRevealSection(
            i18n.editor.evaluation.balance.replace("VARIABLE", i18n.editor.evaluation.partisan),
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
    if (tab.sections.length > 0) {
        toolbar.addTab(tab);
    }
}
