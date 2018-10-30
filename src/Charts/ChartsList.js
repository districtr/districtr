import { html } from "lit-html";

export default class ChartsList {
    constructor(items, target) {
        this.items = items;
        this.target = target;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);
    }
    update(...args) {
        this.items.forEach(item => item.update(...args));
    }
    render() {
        return html`
            ${this.items.map(item => item.render())}
        `;
    }
}
