import { html } from "lit-html";
import Brush from "./Brush";
import ChartsList from "./Charts/ChartsList";
import ElectionResults from "./Charts/ElectionResults";
import PopulationBarChart from "./Charts/PopulationBarChart";
import PopulationDeviation from "./Charts/PopulationDeviation";
import UnassignedPopulation from "./Charts/UnassignedPopulation";
import { districtColors } from "./colors";
import Election from "./Election";
import LayerToggle from "./Layers/LayerToggle";
import PartisanOverlay from "./Layers/PartisanOverlay";
import Part from "./Part";
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

function getCharts(colors, units, layerInfo) {
    const population = new PopulationBarChart(
        colors.map(() => 0),
        colors.map(color => color.hex),
        layerInfo.aggregated.population
    );

    const unassigned = new UnassignedPopulation(
        layerInfo.aggregated.population
    );

    const popDev = new PopulationDeviation(population);

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

    const parts = colors.map(
        color => new Part(color.id, "District", color.hex)
    );

    console.log(parts);

    const election = new Election(election04.id, election04.parties, parts);

    const electionResults = new ElectionResults(election, parts);

    const toggleDistricts = new LayerToggle(units, "Show districts", true);

    const charts = new ChartsList(
        [population, unassigned, popDev, electionResults],
        ([population, unassigned, popDev, electionResults]) => html`
        <section id="charts">
            ${population.render()}
            <dl class="report-data-list">
            ${unassigned.render()}
            ${popDev.render()}
            </dl>
        </section>
        <section id="elections" style="display: none">
            <h4>2004 Presidential Election</h4>
            ${electionResults.render()}
        </section>
        <section id="layers" style="display: none">
            <h4>2004 Presidential Election</h4>
            ${repub2004.render()}
            ${dem2004.render()}
            ${toggleDistricts.render()}
        </section>
        `
    );
    return charts;
}

export default function initializeTools(units, layerInfo) {
    const colors = getColors(layerInfo);

    const charts = getCharts(colors, units, layerInfo);

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

const election04 = {
    id: "2004",
    parties: {
        Democratic: "Pres04D",
        Republican: "Pres04R"
    }
};

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
