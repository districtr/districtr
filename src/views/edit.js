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

function renderAboutModal() {
    const target = document.getElementById("modal");
    const template = html`
        <div class="modal-wrapper" @click="${() => render("", target)}">
            <div class="modal-content">
                <h2>Lowell, MA</h2>
                <p>
                    The units you see here are the 1,845 census blocks that make
                    up the municipality of Lowell, MA.
                </p>
                <p>
                    Data for this module was obtained from the US Census Bureau.
                    The block shapefile for the city of Lowell was downloaded
                    from the
                    <a
                        href="https://www.census.gov/geo/maps-data/data/tiger-line.html"
                        >Census's TIGER/Line Shapefiles</a
                    >. Demographic information from the decennial Census was
                    downloaded at the block level from
                    <a
                        href="https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml"
                        >American FactFinder</a
                    >.
                </p>

                <p>
                    The cleaned shapefile with demographic information is
                    <a
                        href="https://github.com/gerrymandr/Districtr-Prep/tree/master/Lowell"
                        >available for download</a
                    >
                    from the MGGG GitHub account.
                </p>
            </div>
        </div>
    `;
    render(template, target);
}

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
    let items = [
        {
            render: () => html`
                <button
                    class="square-button"
                    @click="${() => navigateTo("/new")}"
                >
                    New Plan
                </button>
            `
        },
        {
            render: () => html`
                <button class="square-button" @click="${state.exportAsJSON}">
                    Export Plan
                </button>
            `
        }
    ];
    if (state.place.id === "lowell_blocks") {
        items = [
            {
                render: () => html`
                    <button
                        class="square-button"
                        @click="${() => renderAboutModal(state.place.about)}"
                    >
                        About
                    </button>
                `
            },
            ...items
        ];
    }
    return items;
}

renderEditView();
