import Brush, { BrushColorPicker, BrushSlider } from "./Brush";
import { districtColors } from "./colors";

export default function initializeTools(units) {
    const population = new Population(districtColors.map(() => 0), "tot_pop");

    const brush = new Brush(units, 10, 0, population.update);

    const brushSlider = new BrushSlider(
        document.getElementById("brush-radius"),
        document.getElementById("brush-radius-value"),
        brush
    );

    const toolSelector = new ToolSelector(
        {
            pan: new PanTool(),
            brush: brush
        },
        "tool"
    );

    const colorPicker = new BrushColorPicker(
        brush,
        districtColors.map((v, i) => `brush-color__${i}`)
    );
}

class PanTool {
    activate() {
        return null;
    }
    deactivate() {
        return null;
    }
}

export class ToolSelector {
    constructor(tools, name) {
        this.tools = tools;
        this.name = name;
        this.activeTool = this.getActiveTool();

        this.selectTool = this.selectTool.bind(this);

        for (let toolId in tools) {
            document
                .getElementById(toolId)
                .addEventListener("input", this.selectTool);
        }
    }
    getActiveTool() {
        const checkedInput = document.querySelector(
            `input[name="${this.name}"]:checked`
        );
        return checkedInput ? checkedInput.value : null;
    }
    selectTool(e) {
        const toolId = e.target.value;
        if (this.activeTool !== toolId) {
            this.tools[this.activeTool].deactivate();
            this.activeTool = toolId;
            this.tools[toolId].activate();
        }
    }
}

class Population {
    constructor(initialData, populationKey) {
        this.data = initialData;
        this.populationKey = populationKey;

        this.update = this.update.bind(this);
    }

    update(feature, color) {
        this.data[color] += feature.properties[this.populationKey];
        this.data[feature.color] -= feature.properties[this.populationKey];
    }
}
