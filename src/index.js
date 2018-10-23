import Brush, { BrushSlider } from "./Brush";
import { HoverWithRadius } from "./Hover";
import Layer, { addBelowLabels } from "./Layer";
import { initializeMap } from "./map";

const map = initializeMap("map");

document.getElementById("toolbar").style = "display: none;";

map.on("load", () => addPlaceholderLayers(map));

function addPlaceholderLayers(map) {
    const placeholderLayerSource = {
        type: "vector",
        url: "mapbox://districtr.5hsufp8g"
    };

    map.addSource("units", placeholderLayerSource);

    // Right now I'm assuming colors are numbered, and that -1 means
    // a block hasn't been colored. I don't think this is a good system.

    const districtColors = ["#0099cd", "#cd9900"];
    const districtHoverColors = ["#006b9c", "#9c6b00"];
    const blockColorStyle = [
        "case",
        ...districtColors
            .map((color, i) => [["==", ["feature-state", "color"], i], color])
            .reduce((list, pair) => [...list, ...pair]),
        "#f9f9f9"
    ];

    const hoveredBlockColorStyle = [
        "case",
        ...districtHoverColors
            .map((color, i) => [["==", ["feature-state", "color"], i], color])
            .reduce((list, pair) => [...list, ...pair]),
        "#aaaaaa"
    ];

    const blockColorProperty = [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        hoveredBlockColorStyle,
        blockColorStyle
    ];

    const units = new Layer(
        map,
        {
            id: "units",
            source: "units",
            "source-layer": "Lowell_blocks-aosczb",
            type: "fill",
            paint: {
                "fill-color": blockColorProperty,
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
            "source-layer": "Lowell_blocks-aosczb",
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

    const colorPicker = new BrushColorPicker(
        brush,
        districtColors.map((v, i) => `brush-color__${i}`)
    );

    document.getElementById("toolbar").style = "";
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

export class BrushColorPicker {
    constructor(brush, colorIds) {
        this.brush = brush;

        this.selectColor = this.selectColor.bind(this);

        const elements = colorIds.map(id => document.getElementById(id));
        for (let element of elements) {
            if (element.checked) {
                this.brush.setColor(parseInt(element.value));
            }
            element.addEventListener("input", this.selectColor);
        }
    }
    selectColor(e) {
        const color = parseInt(e.target.value);
        this.brush.setColor(color);
    }
}
