import { html, render } from "lit-html";
import Tabs from "./Tabs";

export default class Toolbar {
    constructor(tools, activeTool, children, target) {
        this.tools = tools;
        this.activeTool = activeTool;
        this.target = target;
        this.children = children;

        this.render = this.render.bind(this);
        this.selectTool = this.selectTool.bind(this);

        this.toolsById = tools.reduce(
            (lookup, tool) => ({
                ...lookup,
                [tool.id]: tool
            }),
            {}
        );

        this.tools.forEach(tool => {
            if (tool.options !== undefined) {
                tool.options.renderToolbar = this.render;
            }
        });
    }
    selectTool(toolId) {
        this.toolsById[this.activeTool].deactivate();
        this.toolsById[toolId].activate();
        this.activeTool = toolId;
        this.render();
    }
    render() {
        const activeTool = this.toolsById[this.activeTool];
        render(
            html`
            <fieldset class="icon-list">
            <legend>Tools</legend>
            ${this.tools.map(tool => tool.render(this.selectTool))}
            </fieldset>
            <section id="tool-options" class="${
                activeTool.options !== undefined ? "active" : ""
            }">
            ${
                activeTool.options !== undefined
                    ? activeTool.options.render()
                    : ""
            }
            </section>
            ${Tabs(tabs, () => null)}
            <section id="reports">
            ${this.children.map(x => x.render())}
            </section>`,
            this.target
        );
    }
}

const tabs = [
    { value: "charts", name: "Charts", checked: true },
    { value: "layers", name: "Layers" }
];
