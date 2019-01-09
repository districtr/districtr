import { html } from "lit-html";
import ChartsList from "./Charts/ChartsList";
import electionResults from "./Charts/ElectionResults";
import Toggle from "./components/Toggle";
import { main } from "./index";
import { createMarginPerCapitaRule, voteShareRule } from "./Layers/color-rules";
import PartisanOverlayContainer from "./Layers/PartisanOverlayContainer";
import Brush from "./Map/Brush";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";
import Toolbar from "./Toolbar/Toolbar";

function getLayers(state) {
    const toggleDistricts = new Toggle("Show districts", true, checked => {
        if (checked) {
            state.units.setOpacity(0.8);
        } else {
            state.units.setOpacity(0);
        }
    });

    const colorRules = [
        { name: "Vote share", rule: voteShareRule },
        {
            name: "Margin per capita",
            rule: createMarginPerCapitaRule(state.population)
        }
    ];

    let partisanOverlays = new PartisanOverlayContainer(
        state.layers,
        state.elections,
        colorRules
    );
    return () => html`
        <section id="layers" class="toolbar-section layer-list">
            ${partisanOverlays.render()} ${toggleDistricts.render()}
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
        tabs.push(elections, layersTab);
    }

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
                            main();
                        }
                    }"
                >
                    New Plan
                </button>
            `
        }
    ];
}
