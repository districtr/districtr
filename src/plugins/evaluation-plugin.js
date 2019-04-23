import { actions } from "../reducers/charts";
import ElectionResultsSection from "../components/Charts/ElectionResultsSection";
import RacialBalanceTable from "../components/Charts/RacialBalanceTable";
import RevealSection from "../components/RevealSection";

export default function EvaluationPlugin(editor) {
    const { state, toolbar } = editor;
    let sections = [];
    if (state.population.subgroups.length > 1) {
        sections.push(({ population }, activeParts, uiState, dispatch) =>
            RevealSection(
                "Racial Balance",
                RacialBalanceTable(
                    "racialBalance",
                    population,
                    activeParts,
                    uiState.charts.racialBalance,
                    dispatch
                ),
                uiState.charts.racialBalance.isOpen,
                () => dispatch(actions.toggleOpen({ chart: "racialBalance" }))
            )
        );
    }
    if (state.vap) {
        sections.push(({ vap }, activeParts, uiState, dispatch) =>
            RevealSection(
                "VAP Balance",
                RacialBalanceTable(
                    "vapBalance",
                    vap,
                    activeParts,
                    uiState.charts.vapBalance,
                    dispatch
                ),
                uiState.charts.vapBalance.isOpen,
                () => dispatch(actions.toggleOpen({ chart: "vapBalance" }))
            )
        );
    }
    if (state.elections.length > 0) {
        sections.push(({ elections }, activeParts, uiState, dispatch) =>
            RevealSection(
                "Partisan Balance",
                ElectionResultsSection(
                    elections,
                    activeParts,
                    uiState,
                    dispatch
                ),
                uiState.charts.electionResults.isOpen,
                () => dispatch(actions.toggleOpen({ chart: "electionResults" }))
            )
        );
    }
    if (sections.length > 0) {
        const evaluationTab = new EvaluationTab(sections, state);
        toolbar.addTab(evaluationTab);
    }
}

export class EvaluationTab {
    constructor(sections, state) {
        this.id = "evaluation";
        this.name = "Evaluation";
        this.sections = sections;
        this.state = state;

        this.render = this.render.bind(this);
    }
    render(uiState, dispatch) {
        const activeParts = this.state.parts.filter(part => part.visible);
        return this.sections.map(section =>
            section(this.state, activeParts, uiState, dispatch)
        );
    }
}
