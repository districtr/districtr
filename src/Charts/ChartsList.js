import { html } from "lit-html";

const defaultTemplate = items => html`
${items.map(item => item.render())}
`;

export default class ChartsList {
    constructor(items, template) {
        this.items = items;

        this.update = this.update.bind(this);
        this.render = this.render.bind(this);

        if (template === undefined) {
            template = defaultTemplate;
        }
        this.template = template;
    }
    update(...args) {
        for (let item of this.items) {
            item.update(...args);
        }
    }
    render() {
        return this.template(this.items);
    }
}
