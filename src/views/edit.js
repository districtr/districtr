import { html, render } from "lit-html";
import Criteria from "../components/Charts/Criteria";
import Evaluation from "../components/Evaluation";
import LayersTab from "../components/LayersTab";
import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import Toolbar from "../components/Toolbar/Toolbar";
import Brush from "../Map/Brush";
import { initializeMap } from "../Map/map";
import State from "../models/State";
import { navigateTo } from "../routes";

function getContextFromStorage() {
    const placeJson = localStorage.getItem("place");
    const problemJson = localStorage.getItem("districtingProblem");

    if (placeJson === null || problemJson === null) {
        navigateTo("/new");
    }

    const place = JSON.parse(placeJson);
    const problem = JSON.parse(problemJson);

    const planId = localStorage.getItem("planId");
    const assignmentJson = localStorage.getItem("assignment");
    const assignment = assignmentJson ? JSON.parse(assignmentJson) : null;

    return { place, problem, id: planId, assignment };
}

export function renderEditView() {
    const context = getContextFromStorage();

    const root = document.getElementById("root");
    root.className = "";
    render(
        html`
            <div id="map"></div>
            <div id="toolbar"></div>
        `,
        root
    );
    const map = initializeMap("map");
    map.on("load", () => {
        let state = new State(map, context);
        toolbarView(state);
    });
}

function getTabs(state) {
    const criteria = {
        id: "criteria",
        name: "Population",
        render: (uiState, dispatch) =>
            html`
                ${Criteria(state, uiState, dispatch)}
            `
    };

    const layersTab = new LayersTab("layers", "Data Layers", state);

    const evaluationTab = {
        id: "evaluation",
        name: "Evaluation",
        render: (uiState, dispatch) =>
            html`
                ${Evaluation(state, uiState, dispatch)}
            `
    };

    let tabs = [criteria, layersTab];

    if (state.supportsEvaluationTab()) {
        tabs.push(evaluationTab);
    }
    return tabs;
}

function getTools(state) {
    const brush = new Brush(state.units, 20, 0);
    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush),
        new InspectTool(state.units, [
            state.population.total,
            ...state.population.subgroups
        ])
    ];
    tools[0].activate();
    return tools;
}

export default function toolbarView(state) {
    const tools = getTools(state);
    const tabs = getTabs(state);

    const toolbar = new Toolbar(tools, "pan", tabs, getMenuItems(state), {
        tabs: { activeTab: tabs.length > 0 ? tabs[0].id : null },
        elections: {
            activeElectionIndex: 0
        },
        subgroups: {
            activeSubgroupIndices: state.problem.relevantSubgroups || [0, 1]
        },
        charts: {
            population: { isOpen: true },
            racialBalance: { isOpen: true },
            electionResults: { isOpen: true }
        }
    });

    toolbar.render();

    state.subscribe(toolbar.render);
}

// It's not a great design to have these non-tool items in the row of tool icons.
// TODO: Find a different UI for New/Save/Export-type actions.
function getMenuItems(state) {
    return [
        {
            render: () => html`
                <button class="square-button" @click="${state.exportAsJSON}">
                    Export Plan
                </button>
            `
        },
        {
            render: () => html`
                <button
                    class="square-button"
                    @click="${() => navigateTo("/new")}"
                >
                    New Plan
                </button>
            `
        }
    ];
}

renderEditView();
