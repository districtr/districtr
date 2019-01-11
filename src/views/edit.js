import { html, render } from "lit-html";
import ChartsList from "./Charts/ChartsList";
import electionResults from "./Charts/ElectionResults";
import Toggle from "./components/Toggle";
import { createMarginPerCapitaRule, voteShareRule } from "./Layers/color-rules";
import DemographicOverlayContainer from "./Layers/DemographicOverlayContainer";
import PartisanOverlayContainer from "./Layers/PartisanOverlayContainer";
import Brush from "./Map/Brush";
import { initializeMap } from "./Map/map";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";
import Toolbar from "./Toolbar/Toolbar";
import { renderNewPlanView } from "./views/new";

export function renderEditView(createState) {
    const root = document.getElementById("root");
    root.setAttribute("class", null);
    render(
        html`
            <div id="map"></div>
            <div id="toolbar"></div>
        `,
        root
    );
    const map = initializeMap("map");
    map.on("load", () => {
        let state = createState(map);
        state.units.whenLoaded(() => {
            // TODO: We can and should use lit-html to start rendering before the layers
            // are all loaded
            toolbarView(state);
        });
    });
}

function getLayers(state) {
    const toggleDistricts = new Toggle(
        `Show ${state.partPlural.toLowerCase()}`,
        true,
        checked => {
            if (checked) {
                state.units.setOpacity(0.8);
            } else {
                state.units.setOpacity(0);
            }
        }
    );

    const colorRules = [
        { name: "Vote share", rule: voteShareRule },
        {
            name: "Margin per capita",
            rule: createMarginPerCapitaRule(state.population)
        }
    ];

    let partisanOverlays =
        state.elections.length > 0
            ? new PartisanOverlayContainer(
                  state.layers,
                  state.elections,
                  colorRules
              )
            : null;

    let demographicOverlays = new DemographicOverlayContainer(
        state.layers,
        state.population
    );

    return () => html`
        <section id="layers" class="toolbar-section layer-list">
            ${partisanOverlays ? partisanOverlays.render() : ""}
            <h4>${state.partPlural}</h4>
            ${toggleDistricts.render()} ${demographicOverlays.render()}
        </section>
    `;
}

function getTabs(state) {
    const charts = {
        id: "charts",
        name: "Population",
        render: () => ChartsList(state)
    };
    const elections = {
        id: "elections",
        name: "Votes",
        render: () => html`
            <section class="toolbar-section" id="elections">
                ${
                    state.elections.map(election =>
                        electionResults(election, state.parts)
                    )
                }
            </section>
        `
    };
    const layersTab = {
        id: "layers",
        name: "Layers",
        render: getLayers(state)
    };

    let tabs = [charts];

    if (state.elections.length > 0) {
        tabs.push(elections);
    }

    tabs.push(layersTab);

    return tabs;
}

export default function toolbarView(state) {
    const brush = new Brush(state.units, 20, 0);

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush)
    ];
    tools[0].activate();

    const toolbar = new Toolbar(
        tools,
        "pan",
        getTabs(state),
        getMenuItems(state)
    );

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
