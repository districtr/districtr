import Brush, { BrushSlider } from "./Brush";
import { HoverWithRadius } from "./Hover";
import Layer, { addBelowLabels } from "./Layer";
import { initializeMap } from "./map";

const map = initializeMap("map");

map.on("load", () => addPlaceholderLayers(map));

function addPlaceholderLayers(map) {
    const placeholderLayerSource = {
        type: "vector",
        url: "mapbox://districtr.5rvygwsf"
    };

    map.addSource("units", placeholderLayerSource);

    const hoverStyle = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#aaaaaa",
        "#f9f9f9"
    ];

    // Right now I'm assuming colors are numbered, and that -1 means
    // a block hasn't been colored. I don't think this is a good system.

    const districtColors = ["#0099cd", "#cd9900"];
    const districtColorStyle = [
        "case",
        ...districtColors
            .map((color, i) => [["==", ["feature-state", "color"], i], color])
            .reduce((list, pair) => [...list, ...pair]),
        ["==", ["feature-state", "hover"], true],
        "#aaaaaa",
        "#f9f9f9"
    ];

    const units = new Layer(
        map,
        {
            id: "units",
            source: "units",
            "source-layer": "data-cktc5t",
            type: "fill",
            paint: {
                "fill-color": districtColorStyle,
                "fill-opacity": 0.8
            }
        },
        addBelowLabels
    );
    const unitsBorders = new Layer(
        map,
        {
            id: "units-borders",
            type: "line",
            source: "units",
            "source-layer": "data-cktc5t",
            paint: {
                "line-color": "#010101",
                "line-width": 1,
                "line-opacity": 0.3
            }
        },
        addBelowLabels
    );

    // Tools

    const hover = new HoverWithRadius(units, 10);
    const brush = new Brush(hover, 0);
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
        console.log(e);
        const toolId = e.target.value;
        if (this.activeTool !== toolId) {
            this.tools[this.activeTool].deactivate();
            this.activeTool = toolId;
            this.tools[toolId].activate();
        }
    }
}
