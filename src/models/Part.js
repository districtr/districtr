import { html } from "lit-html";

export default class Part {
    constructor(id, noun, color) {
        this.id = id;
        this.noun = noun;
        this.color = color;
    }
    renderLabel() {
        return html`
        <span class="part-number" style="background: ${this.color}">
        ${this.id}
        </span>`;
    }
}
