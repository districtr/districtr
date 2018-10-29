import { html, render } from "lit-html";

class Tooltip {
    constructor(template) {
        this.template = template;
        this.target = document.getElementById("tooltip");
        this.onMouseEnter = this.onMouseEnter.bind(this);
        this.onMouseLeave = this.onMouseLeave.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
    onMouseLeave(e, state) {
        this.state = state;
        this.visible = false;
        this.render();
    }
    onMouseEnter(e, state) {
        this.state = state;
        this.visible = true;
        this.getMousePosition(e);
        this.render();
    }
    onMouseMove(e, state) {
        this.state = state;
        this.visible = true;
        this.getMousePosition(e);
        this.render();
    }
    getMousePosition(e) {
        if (e.pageX) {
            this.x = e.pageX;
        }
        if (e.pageY) {
            this.y = e.pageY;
        }
    }
    render() {
        const style = `transform: translate(${this.x}px, ${this.y}px)${
            this.visible ? "" : "; opacity: 0"
        }`;
        render(
            html`
        <div class="tooltip-container" style=${style}>
        ${this.template(this.state)}
        </div>`,
            this.target
        );
    }
}
