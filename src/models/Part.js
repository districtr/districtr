import { html } from "lit-html";

export default class Part {
    constructor(id, noun, displayNumber, color, visible = true) {
        this.id = id;
        this.noun = noun;
        this.displayNumber = displayNumber;
        this.color = color.hex;
        this.hoverColor = color.hoverHex;
        this.visible = visible;
    }
    updateDescription({ name, description }) {
        this.name = name;
        this.description = description;
    }
    serialize() {
        return {
            id: this.id,
            displayNumber: this.displayNumber,
            name: this.name,
            description: this.description
        };
    }
    renderLabel() {
        return html`
            <span class="part-number" style="background: ${this.color}">
                ${this.displayNumber}
            </span>
        `;
    }
}
