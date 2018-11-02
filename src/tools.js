import { html } from "lit-html";
import Brush from "./Brush";
import ChartsList from "./Charts/ChartsList";
import LayerToggle from "./Layers/LayerToggle";
import PartisanOverlay from "./Layers/PartisanOverlay";
import State from "./models/State";
import Toolbar from "./Toolbar";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";

function getLayers(state, units) {
    const repub2004 = new PartisanOverlay(
        units,
        state.elections[0],
        "Republican"
    );
    const dem2004 = new PartisanOverlay(
        units,
        state.elections[0],
        "Democratic"
    );

    const toggleDistricts = new LayerToggle(units, "Show districts", true);

    const layersTab = () => html`
    <section id="layers" style="display: none">
    <h4>2004 Presidential Election</h4>
    ${repub2004.render()}
    ${dem2004.render()}
    ${toggleDistricts.render()}
    </section>
    `;

    return layersTab;
}

export default function initializeTools(units, layerInfo) {
    let state = new State(layerInfo, units);

    const charts = () => ChartsList(state);
    const layersTab = getLayers(state, units);

    const brush = new Brush(units, 20, 0);

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush)
    ];
    tools[0].activate();

    const toolbar = new Toolbar(
        tools,
        "pan",
        [charts, layersTab],
        document.getElementById("toolbar")
    );
    toolbar.render();

    // unfortunately have to register this after the fact
    brush.subscribe({
        afterFeature: state.update,
        afterColoring: toolbar.render
    });
}
