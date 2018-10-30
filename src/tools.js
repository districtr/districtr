import { html } from "lit-html";
import Brush from "./Brush";
import ChartsList from "./Charts/ChartsList";
import PopulationBarChart from "./Charts/PopulationBarChart";
import PopulationDeviation from "./Charts/PopulationDeviation";
import UnassignedPopulation from "./Charts/UnassignedPopulation";
import { districtColors } from "./colors";
import Toolbar from "./Toolbar";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";

function getColors(layerInfo) {
    let colors = districtColors;
    for (let color of colors) {
        color.checked = false;
    }
    colors[0].checked = true;

    if (layerInfo.numberOfDistricts) {
        colors = colors.slice(0, layerInfo.numberOfDistricts);
    }
    return colors;
}

function getCharts(colors, layerInfo) {
    const population = new PopulationBarChart(
        colors.map(() => 0),
        colors,
        layerInfo.aggregated.population
    );

    const unassigned = new UnassignedPopulation(
        layerInfo.aggregated.population
    );

    const popDev = new PopulationDeviation(population);

    const charts = new ChartsList(
        [population, unassigned, popDev],
        ([population, unassigned, popDev]) => html`
        <section id="charts">
            ${population.render()}
            <dl class="report-data-list">
            ${unassigned.render()}
            ${popDev.render()}
            </dl>
        </section>
        `
    );
    return charts;
}

export default function initializeTools(units, layerInfo) {
    const colors = getColors(layerInfo);

    const charts = getCharts(colors, layerInfo);

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
        [charts],
        document.getElementById("toolbar")
    );
    toolbar.render();

    // unfortunately have to register this after the fact
    brush.subscribe({
        afterFeature: charts.update,
        afterColoring: toolbar.render
    });
}
