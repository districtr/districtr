import { html } from "lit-html";
import Tooltip from "../../map/Tooltip";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";
import Select from "../Select";
import { TooltipContent } from "../Charts/TooltipContent";

export default class InspectTool extends Tool {
    constructor(units, columnSets, nameColumn, unitsRecord, parts) {
        super(
            "inspect",
            "Inspect",
            html`
                <i class="material-icons">search</i>
            `
        );

        this.columnSets = columnSets;
        this.activeColumnSetIndex = 0;

        const renderTooltipContent = features =>
            TooltipContent(
                features,
                this.activeColumnSet,
                nameColumn,
                unitsRecord.unitType,
                parts
            );
        this.layer = units;
        this.tooltip = new Tooltip(units, renderTooltipContent);
        this.options = new InspectToolOptions(this);

        this.changeColumnSetByIndex = this.changeColumnSetByIndex.bind(this);
    }
    changeColumnSetByIndex(i) {
        this.activeColumnSetIndex = i;
    }
    get activeColumnSet() {
        return this.columnSets[this.activeColumnSetIndex];
    }
    activate() {
        super.activate();
        this.layer.map.getCanvas().classList.add("inspect-tool");
        this.tooltip.activate();
    }
    deactivate() {
        super.deactivate();
        this.layer.map.getCanvas().classList.remove("inspect-tool");
        this.tooltip.deactivate();
    }
}

class InspectToolOptions {
    constructor(inspectTool) {
        this.inspectTool = inspectTool;
        this.changeRadius = this.changeRadius.bind(this);
    }
    changeRadius(e) {
        e.stopPropagation();
        let value = parseInt(e.target.value);
        if (this.inspectTool.tooltip.radius != value) {
            this.inspectTool.tooltip.radius = value;
        }
        this.renderToolbar();
    }
    render() {
        return html`
            <div class="ui-option">
                <legend class="ui-label ui-label--row">Tooltip Data</legend>
                ${Select(
                    this.inspectTool.columnSets,
                    this.inspectTool.changeColumnSetByIndex
                )}
            </div>
            ${BrushSlider(this.inspectTool.tooltip.radius, this.changeRadius, {
                title: "Spotlight Size"
            })}
        `;
    }
}
