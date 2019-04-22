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
import { renderAboutModal } from "../components/Modal";
import { navigateTo, loadPlanFromURL, getContextFromStorage } from "../routes";

function getPlanFromRoute() {
    let planId = window.location.pathname.slice("/edit/".length).trim();
    if (planId.length == 0) {
        planId = window.location.hash.slice(1).trim();
    }
    return planId.slice("chi-".length);
}

function getPlanContext() {
    const planId = getPlanFromRoute();
    if (planId.length > 0) {
        const planFile = `${planId}.json`;
        return loadPlanFromURL(`/assets/chicago-plans/${planFile}`).catch(e => {
            // eslint-disable-next-line no-console
            console.error(`Could not load plan ${planId}`);
            // eslint-disable-next-line no-console
            console.error(e);
        });
    } else {
        return Promise.resolve(getContextFromStorage());
    }
}

export default function renderEditView() {
    getPlanContext().then(context => {
        const root = document.getElementById("root");
        root.className = "";
        render(
            html`
                <div id="map"></div>
                <div id="toolbar"></div>
            `,
            root
        );
        const map = initializeMap("map", {
            bounds: context.units.bounds,
            fitBoundsOptions: {
                padding: {
                    top: 50,
                    right: 350,
                    left: 50,
                    bottom: 50
                }
            }
        });
        map.on("load", () => {
            map.setMaxBounds(map.getBounds());
            let state = new State(map, context);
            toolbarView(state);
        });
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
        new InspectTool(
            state.units,
            state.columnSets,
            state.nameColumn,
            state.unitsRecord,
            state.parts
        )
    ];
    tools[0].activate();
    return tools;
}

function toolbarView(state) {
    const tools = getTools(state);
    const tabs = getTabs(state);

    const toolbar = new Toolbar(tools, "pan", tabs, getMenuItems(state), {
        tabs: { activeTab: tabs.length > 0 ? tabs[0].id : null },
        elections: {
            activeElectionIndex: 0
        },
        charts: {
            population: { isOpen: true },
            racialBalance: {
                isOpen: true,
                activeSubgroupIndices: state.population.indicesOfMajorSubgroups()
            },
            electionResults: { isOpen: false },
            vapBalance: {
                isOpen: false,
                activeSubgroupIndices: state.vap
                    ? state.vap.indicesOfMajorSubgroups()
                    : null
            }
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
    if (state.place.about) {
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
