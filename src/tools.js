import Brush from "./Brush";
import PopulationBarChart from "./Charts/PopulationBarChart";
import { districtColors } from "./colors";
import Toolbar from "./Toolbar";

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

    let tools = [new Tool("pan", "Pan", "pan_tool"), new BrushTool(brush)];
    tools[0].activate();

    const toolbar = new Toolbar(tools, colors, brush);
    toolbar.render();
    population.render();
}

class Tool {
    constructor(id, name, icon) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.active = false;
    }
    activate() {
        this.active = true;
    }
    deactivate() {
        this.active = false;
    }
}

class BrushTool extends Tool {
    constructor(brush) {
        super("brush", "Brush", "brush");
        this.brush = brush;
    }
    activate() {
        super.activate();
        this.brush.activate();
    }
    deactivate() {
        super.deactivate();
        this.brush.deactivate();
    }
}
