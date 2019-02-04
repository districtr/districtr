import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import { HoverWithRadius } from "./Hover";

/**
 * A floating tooltip
 *
 * @param {Layer} layer - show the tooltip when features from this layer are
 *  hovered over.
 * @param {function} content - function that returns the tooltip content
 */
export default class Tooltip extends HoverWithRadius {
    constructor(layer, content, radius = 1) {
        super(layer, radius);

        this.content = content;

        this.container = document.createElement("div");
        layer.map.getContainer().appendChild(this.container);
    }
    activate() {
        super.activate();
    }
    deactivate() {
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
    render() {
        render(
            html`
                <aside
                    class=${classMap({ tooltip: true, hidden: !this.visible })}
                    style=${styleMap({
                        left: `${this.x + 4}px`,
                        top: `${this.y + 8}px`
                    })}
                >
                    ${this.content(this.hoveredFeatures)}
                </aside>
            `,
            this.container
        );
    }
}
