import { html, render } from "lit-html";
import ChartsList from "../components/Charts/ChartsList";
import LayersTab from "../components/LayersTab";
import RaceTab from "../components/RaceTab";
import BrushTool from "../components/Toolbar/BrushTool";
import EraserTool from "../components/Toolbar/EraserTool";
import InspectTool from "../components/Toolbar/InspectTool";
import PanTool from "../components/Toolbar/PanTool";
import Toolbar from "../components/Toolbar/Toolbar";
import VotesTab from "../components/VotesTab";
import Brush from "../Map/Brush";
import { initializeMap } from "../Map/map";
import State from "../models/State";
import { renderNewPlanView } from "./new";

export function renderEditView() {
    const placeJson = localStorage.getItem("place");
    const problemJson = localStorage.getItem("problem");

    if (!placeJson || !problemJson) {
        window.location.assign("./new.html");
    }

    const place = JSON.parse(placeJson);
    const problem = JSON.parse(problemJson);

    const planId = localStorage.getItem("planId");
    const assignment = localStorage.getItem("assignment");

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
        let state = new State(map, place, problem, planId, assignment);
        state.units.onceLoaded(() => {
            // TODO: We can and should use lit-html to start rendering before the layers
            // are all loaded
            toolbarView(state);
        });
    });
}

function getTabs(state) {
    const charts = {
        id: "charts",
        name: "Population",
        render: () =>
            html`
                ${ChartsList(state)}
            `
    };

    const layersTab = new LayersTab("layers", "Layers", state);

    let tabs = [charts];

    if (state.elections.length > 0) {
        tabs.push(new VotesTab("votes", "Votes", state.elections, state.parts));
    }

    if (state.population.subgroups.length > 0) {
        tabs.push(
            new RaceTab("race", "Demographics", state.population, state.parts)
        );
    }

    tabs.push(layersTab);

    return tabs;
}

export default function toolbarView(state) {
    const brush = new Brush(state.units, 20, 0);

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

    const tabs = getTabs(state);

    const toolbar = new Toolbar(tools, "pan", tabs, getMenuItems(state), {
        tabs: { activeTab: tabs.length > 0 ? tabs[0].id : null },
        elections: {
            activeElectionIndex: 0
        },
        subgroups: {
            activeSubgroupIndices: state.problem.relevantSubgroups || [0, 1]
        }
    });

    toolbar.render();

    state.subscribe(toolbar.render);

    brush.on("colorfeature", state.update);
    brush.on("colorend", state.render);
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
                    @click="${
                        () => {
                            state.map.remove();
                            renderNewPlanView();
                        }
                    }"
                >
                    New Plan
                </button>
            `
        }
    ];
}

export function main() {
    renderEditView();
}
