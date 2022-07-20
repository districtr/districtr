import { html, render } from "lit-html";
import { classMap } from "lit-html/directives/class-map";
import { styleMap } from "lit-html/directives/style-map";
import { HoverWithRadius } from "./Hover";

/**
 * A floating tooltip.
 * @param {Layer} layer - show the tooltip when features from this layer are
 *  hovered over.
 * @param {function} content - function that returns the tooltip content
 */
export default class Tooltip extends HoverWithRadius {
    constructor(layer, content, radius = 1, index) {
        super(layer, radius);

        this.content = content;
        this.index = index;

        this.container = document.createElement("div");
        layer.map.getContainer().appendChild(this.container);
    }
    activate() {
        super.activate();
    }
    deactivate() {
        super.deactivate();
        this.hoverOff();
        this.visible = false;
        this.render();
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
        let fs = this.hoveredFeatures;
        if (fs.length && Object.keys(fs[0].properties).includes("GEOINDEX")) {
          if (!window.lastNYCinspect) {
            window.lastNYCinspect = "";
          }
          const queryBlocks = fs.map(f => f.properties.GEOINDEX).sort();
          if (queryBlocks.join(",") === window.lastNYCinspect) {
            // inspect area has not changed
            return;
          }
          window.lastNYCinspect = queryBlocks.join(",");

          fetch("//mggg.pythonanywhere.com/nyc-assist", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ colors: {
              '-1': {
                added: queryBlocks,
                removed: []
              }
            }}),
          }).then(res => res.json()).then(counts => {
            const newp = JSON.parse(counts['-1']['+']);
            Object.keys(newp).forEach((col) => {
              fs[0].properties[col] = newp[col];
            });
            let insert = this.content(fs, this.index);
            render(
                html`
                    <aside
                        class=${classMap({
                            tooltip: true,
                            "tooltip--hidden": (!this.visible || !insert)
                        })}
                        style=${styleMap({
                            left: `${this.x + 4}px`,
                            top: `${this.y + 8}px`
                        })}
                    >
                        ${insert}
                    </aside>
                `,
                this.container
            );
          });
          return;
        }
        let insert = this.content(this.hoveredFeatures, this.index);
        render(
            html`
                <aside
                    class=${classMap({
                        tooltip: true,
                        "tooltip--hidden": (!this.visible || !insert)
                    })}
                    style=${styleMap({
                        left: `${this.x + 4}px`,
                        top: `${this.y + 8}px`
                    })}
                >
                    ${insert}
                </aside>
            `,
            this.container
        );
    }
}
