import Brush from "./Brush";
import PopulationBarChart from "./Charts/PopulationBarChart";
import { districtColors } from "./colors";
import Toolbar from "./Toolbar";
import BrushTool from "./Toolbar/BrushTool";
import EraserTool from "./Toolbar/EraserTool";
import PanTool from "./Toolbar/PanTool";

export default function initializeTools(units, layerInfo) {
    let colors = districtColors.map((x, i) => ({
        id: i,
        name: x,
        checked: false
    }));

    if (layerInfo.numberOfDistricts) {
        colors = colors.slice(0, layerInfo.numberOfDistricts);
    }
    colors[0].checked = true;

    const population = new PopulationBarChart(
        colors.map(() => 0),
        colors,
        layerInfo.aggregated.population,
        layerInfo.populationAttribute
    );
    const brush = new Brush(units, 20, 0, population.update, population.render);

    let tools = [
        new PanTool(),
        new BrushTool(brush, colors),
        new EraserTool(brush)
    ];
    tools[0].activate();

    const toolbar = new Toolbar(
        tools,
        "pan",
        document.getElementById("toolbar")
    );
    toolbar.render();
    population.render();
}
