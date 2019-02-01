import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import { Hover } from "../../Map/Hover";
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

export function TooltipContent(feature, columns) {
    if (feature === null || feature === undefined) {
        return "";
    }
    return html`
        <dl class="tooltip-data">
            ${columns.map(
                column =>
                    html`
                        <div class="tooltip-data__row">
                            <dt>${formatColumnName(column.name)}</dt>
                            <dd>${column.formatValue(feature)}</dd>
                            ${column.getFraction !== undefined
                                ? TooltipBar(column.getFraction(feature))
                                : ""}
                        </div>
                    `
            )}
        </dl>
    `;
}

class Tooltip extends Hover {
    constructor(layer, columns) {
        super(layer, 2);

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

        if (this.hoveredFeature === null) {
            this.visible = false;
        } else {
            this.visible = true;
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
                    ${TooltipContent(this.hoveredFeature, this.columns)}
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
