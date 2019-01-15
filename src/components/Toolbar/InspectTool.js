import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import { Hover } from "../../Map/Hover";
import Tool from "./Tool";

class Tooltip extends Hover {
    constructor(layer) {
        super(layer, 2);

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
    render() {
        render(
            html`
                <aside
                    class=${classMap({ tooltip: true, hidden: !this.visible })}
                    style=${
                        styleMap({
                            left: `${this.x + 5}px`,
                            top: `${this.y + 5}px`
                        })
                    }
                >
                    ${this.hoveredFeature}
                </aside>
            `,
            this.container
        );
    }
}

export default class InspectTool extends Tool {
    constructor(units) {
        super(
            "inspect",
            "Inspect",
            html`
                <i class="material-icons">search</i>
            `
        );
        this.tooltip = new Tooltip(units);
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
