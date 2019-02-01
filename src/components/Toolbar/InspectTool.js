import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import { HoverWithRadius } from "../../Map/Hover";
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

class Tooltip extends HoverWithRadius {
    constructor(layer, columns) {
        super(layer, 1);

        this.columns = columns;

        this.container = document.createElement("div");
        layer.map.getContainer().appendChild(this.container);
    }
    activate() {
        this.layer.map.getCanvas().classList.add("inspect-tool");
        super.activate();
    }
    deactivate() {
        this.layer.map.getCanvas().classList.remove("inspect-tool");
        super.deactivate();
    }
    onMouseMove(e) {
        super.onMouseMove(e);

        this.x = e.point.x;
        this.y = e.point.y;

        if (this.hoveredFeatures.length === 0) {
            setTimeout(() => this.hideIfNoFeatures(), 60);
        } else {
            this.visible = true;
        }
        this.render();
    }
    hideIfNoFeatures() {
        if (this.hoveredFeatures.length === 0) {
            this.visible = false;
        }
        this.render();
    }
    onMouseLeave() {
        super.onMouseLeave();
        this.visible = false;
        this.render();
    }
    setColumns(columns) {
        this.columns = columns;
        this.render();
    }
    render() {
        render(
            html`
                <aside
                    class=${classMap({ tooltip: true, hidden: !this.visible })}
                    style=${styleMap({
                        left: `${this.x + 8}px`,
                        top: `${this.y + 15}px`
                    })}
                >
                    ${TooltipContent(this.hoveredFeatures, this.columns)}
                </aside>
            `,
            this.container
        );
    }
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
        this.tooltip = new Tooltip(units, columns);
        this.options = new InspectToolOptions(this.tooltip);
    }
    activate() {
        super.activate();
        this.tooltip.activate();
    }
    deactivate() {
        super.deactivate();
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
