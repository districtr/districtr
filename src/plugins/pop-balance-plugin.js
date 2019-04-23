import Criteria from "../components/Charts/Criteria";

export default function PopulationBalancePlugin(editor) {
    const tab = {
        id: "criteria",
        name: "Population",
        render: (uiState, dispatch) => Criteria(editor.state, uiState, dispatch)
    };
    editor.toolbar.addTab(tab);
}
