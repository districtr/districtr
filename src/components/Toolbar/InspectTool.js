import { html } from "lit-html";
import Tooltip from "../../map/Tooltip";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";
import Select from "../Select";
import { TooltipContent } from "../Charts/TooltipContent";

export default class InspectTool extends Tool {
    constructor(layers, columnSets, nameColumn, unitsRecord, parts, divisor) {
        super(
            "inspect",
            "Inspect",
            html`<img src="/assets/Icons_Inspect_grey.svg?v=2" alt="Inspect"/>`
        );

        this.columnSets = [].concat(columnSets);
        // separate out 2018/2019 pop
        if (this.columnSets.length && this.columnSets[0].name_alt) {
            this.columnSets.splice(1, 0, this.columnSets[0]);
        }
        this.activeColumnSetIndex = 0;

        const renderTooltipContent = (features, layerIdx) => {
            // precincts / bg layer which should surface on inspect tool
            // for elections or percentages only
            if (this.activeColumnSet.type === "election" || this.activeColumnSet.name.toLowerCase() === "percentages") {
                if ((this.tooltips.length > 1) && !layerIdx) {
                  return;
                }
            } else if (layerIdx) {
                return;
            }

            return TooltipContent(
                features,
                this.activeColumnSet,
                nameColumn,
                unitsRecord.unitType,
                parts,
                this.activeColumnSetIndex,
                divisor
            );
        }
        this.layer = layers[0];
        this.tooltips = [];
        layers.filter(lyr => lyr.type === "fill").forEach((layer, idx) => {
          this.tooltips.push(new Tooltip(layer, renderTooltipContent, 1, idx));
        });
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
        this.tooltips.forEach(tt => tt.activate());
    }
    deactivate() {
        super.deactivate();
        this.layer.map.getCanvas().classList.remove("inspect-tool");
        this.tooltips.forEach(tt => tt.deactivate());
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
        if (this.inspectTool.tooltips[0].radius != value) {
            this.inspectTool.tooltips[0].radius = value;
        }
        this.renderToolbar();
    }
    render() {
        return html`
            <div class="ui-option">
                <legend class="ui-label ui-label--row">Tooltip Data</legend>
                ${Select(
                    this.inspectTool.columnSets.map((col, i) => {
                        return { name: i ? (col.name_alt || col.name) : col.name };
                    }),
                    this.inspectTool.changeColumnSetByIndex,
                    this.inspectTool.activeColumnSetIndex
                )}
            </div>
            ${BrushSlider(this.inspectTool.tooltips[0].radius, this.changeRadius, {
                title: "Spotlight Size"
            })}
        `;
    }
}
