import { html } from "lit-html";
import Tooltip from "../../Map/Tooltip";
import { numberWithCommas, sum } from "../../utils";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";

export function TooltipBar(percent) {
    return html`
        <div
            class="tooltip-data__row__bar"
            style=${`width: ${Math.round(percent * 100)}%`}
        ></div>
    `;
}

function formatColumnName(name) {
    if (name.length > 27) {
        return name.slice(0, 24) + "...";
    } else {
        return name;
    }
}

/**
 * Search through `columns` until we find one with a `total` attribute (this
 * is the case when a column is a `PopulationSubgroup`). Then use that
 * total column to compute the total population of the features, so that
 * we can compute per-capita values for the population subgroup columns.
 * @param {GeoJSON.Feature[]} features
 * @param {NumericalColumn[]} columns
 */
function getTotal(features, columns) {
    for (const column of columns) {
        if (column.total !== undefined) {
            return sum(features.map(f => columns[0].total.getValue(f)));
        }
    }
    return null;
}

/**
 * Render the content of the tooltip element that follows the mouse around.
 * @param {GeoJSON.Feature[]} features
 * @param {NumericalColumn[]} columns
 */
export function TooltipContent(features, columns) {
    if (features === null || features === undefined) {
        return "";
    }
    const total = getTotal(features, columns);
    return html`
        <dl class="tooltip-data">
            ${columns.map(column => {
                const value = sum(features.map(f => column.getValue(f)));
                return html`
                    <div class="tooltip-data__row">
                        <dt>${formatColumnName(column.name)}</dt>
                        <dd>
                            ${numberWithCommas(value)}
                        </dd>
                        ${column.total !== undefined
                            ? TooltipBar(value / total)
                            : ""}
                    </div>
                `;
            })}
        </dl>
    `;
}

export default class InspectTool extends Tool {
    constructor(units, columns) {
        super(
            "inspect",
            "Inspect",
            html`
                <i class="material-icons">search</i>
            `
        );
        const renderTooltipContent = features =>
            TooltipContent(features, columns);
        this.layer = units;
        this.tooltip = new Tooltip(units, renderTooltipContent);
        this.options = new InspectToolOptions(this.tooltip);
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
    constructor(inspectTool, renderToolbar) {
        this.inspectTool = inspectTool;
        this.renderToolbar = renderToolbar;
        this.changeRadius = this.changeRadius.bind(this);
    }
    changeRadius(e) {
        e.stopPropagation();
        let value = parseInt(e.target.value);
        if (this.inspectTool.radius != value) {
            this.inspectTool.radius = value;
        }
        this.renderToolbar();
    }
    render() {
        return html`
            ${BrushSlider(this.inspectTool.radius, this.changeRadius, {
                title: "Spotlight Size"
            })}
        `;
    }
}
