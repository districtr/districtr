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

function getLayers(colors, units, layerInfo) {
    const repub2004 = new PartisanOverlay(
        units,
        election04,
        "Republican",
        repubColorStops
    );
    const dem2004 = new PartisanOverlay(
        units,
        election04,
        "Democratic",
        demColorStops
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
    let state = new State(layerInfo);

    const charts = () => ChartsList(state);
    const layersTab = getLayers();

    const brush = new Brush(units, 20, 0);

    let tools = [
        new PanTool(),
        new BrushTool(brush, colors),
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

const repubColorStops = [
    0,
    "rgba(0,0,0,0)",
    0.5,
    "rgba(0,0,0,0)",
    0.51,
    "#ff5d5d",
    0.6,
    "#ff0000"
];

const demColorStops = [
    0,
    "rgba(0,0,0,0)",
    0.5,
    "rgba(0,0,0,0)",
    0.55,
    "#5d5dff",
    1.0,
    "#0000ff"
];
