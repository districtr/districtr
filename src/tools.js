import { html } from "lit-html";
import Brush from "./Brush";
import ChartsList from "./Charts/ChartsList";
import LayerToggle from "./Layers/LayerToggle";
import PartisanOverlayContainer from "./Layers/PartisanOverlayContainer";
import State from "./models/State";
import Toolbar from "./Toolbar";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";

function getLayers(state, units) {
    const toggleDistricts = new LayerToggle(units, "Show districts", true);
    const partisanOverlays = new PartisanOverlayContainer(
        units,
        state.elections,
        state.population
    );

    const layersTab = () => html`
    <section id="layers" style="display: none">
    ${partisanOverlays.render()}
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
