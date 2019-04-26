import { html } from "lit-html";
import Tooltip from "../../Map/Tooltip";
import { numberWithCommas, sum, zeros } from "../../utils";
import BrushSlider from "./BrushSlider";
import Tool from "./Tool";
import select from "../select";

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

function tooltipDots(features, parts) {
    let partCounts = zeros(parts.length);
    for (let feature of features) {
        if (feature.state.color !== null && feature.state.color !== undefined) {
            partCounts[feature.state.color] += 1;
        }
    }
    if (sum(partCounts) === 0) {
        return "";
    }
    return html`
        <div class="tooltip__dots">
            ${parts.map((part, i) =>
                partCounts[i] > 0
                    ? html`
                          <span
                              class="part-number tooltip__dot"
                              style="background-color: ${part.color}"
                          ></span>
                      `
                    : ""
            )}
        </div>
    `;
}

function tooltipHeading(features, nameColumn, pluralNoun, parts) {
    let title = `${features.length} ${
        features.length == 1 ? pluralNoun.slice(0, -1) : pluralNoun
    }`;
    if (
        nameColumn !== undefined &&
        nameColumn !== null &&
        features.length === 1
    ) {
        title = nameColumn.getValue(features[0]);
    }
    return html`
        <div class="tooltip__text">
            <h4 class="tooltip__title">
                ${title}
            </h4>
            ${tooltipDots(features, parts)}
        </div>
    `;
}

/**
 * Render the content of the tooltip element that follows the mouse around.
 * @param {GeoJSON.Feature[]} features
 * @param {NumericalColumn[]} columns
 */
export function TooltipContent(
    features,
    columnSet,
    nameColumn,
    pluralNoun,
    parts
) {
    if (features === null || features === undefined) {
        return "";
    }
    const total = sum(features.map(f => columnSet.total.getValue(f)));
    return html`
        ${tooltipHeading(features, nameColumn, pluralNoun, parts)}
        <dl class="tooltip-data">
            ${columnSet.columns.map(column => {
                const value = sum(features.map(f => column.getValue(f)));
                return html`
                    <div class="tooltip-data__row">
                        <dt>${formatColumnName(column.name)}</dt>
                        <dd>
                            ${numberWithCommas(Math.round(value))}
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
                <legend class="ui-label">Tooltip Data</legend>
                ${select(
                    "inspect-tool-columns",
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
