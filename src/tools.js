import Brush from "./Brush";
import { districtColors } from "./colors";
import Toolbar from "./Toolbar";

export default function initializeTools(units) {
    const population = new Population(districtColors.map(() => 0), "tot_pop");
    const brush = new Brush(units, 10, 0, population.update, population.render);
    let colors = districtColors.map((x, i) => ({
        id: i,
        name: x,
        checked: false
    }));
    colors[0].checked = true;

    let tools = [new Tool("pan", "Pan"), new BrushTool(brush)];
    tools[0].activate();

    const toolbar = new Toolbar(tools, colors, brush);
    toolbar.render();
}

class Tool {
    constructor(id, name) {
        this.id = id;
        this.name = name;
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
        super("brush", "Brush");
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

class Population {
    constructor(initialData, populationKey) {
        this.data = initialData;
        this.populationKey = populationKey;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }

    update(feature, color) {
        this.data[color] += feature.properties[this.populationKey];
        this.data[feature.state.color] -=
            feature.properties[this.populationKey];
    }

    render() {
        console.log(this.data);
    }
}
