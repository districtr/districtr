import { html } from "lit-html";
import Brush from "./Brush";
import ChartsList from "./Charts/ChartsList";
import LayerToggle from "./Layers/LayerToggle";
import PartisanOverlayContainer from "./Layers/PartisanOverlayContainer";
import Toolbar from "./Toolbar";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import NewMapButton from "./Toolbar/NewMapButton";
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

export default function toolbarView(state) {
    const charts = () => ChartsList(state);
    const layersTab = getLayers(state, state.units);

    const brush = new Brush(state.units, 20, 0);

    let tools = [
        new PanTool(),
        new BrushTool(brush, state.parts),
        new EraserTool(brush),
        new NewMapButton()
    ];
    tools[0].activate();

    const toolbar = new Toolbar(tools, "pan", [charts, layersTab]);

    toolbar.render();

    brush.subscribe({
        afterFeature: state.update,
        afterColoring: toolbar.render
    });
}
