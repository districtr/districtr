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
            <div class="icon-list">
            ${this.tools.map(tool => tool.render(this.selectTool))}
            </div>
            <section id="tool-options" class="${
                activeTool.options !== undefined ? "active" : ""
            }">
            ${
                activeTool.options !== undefined
                    ? activeTool.options.render()
                    : ""
            }
            </section>
            ${tabMenu.render()}
            <div id="tab-section-body">
            ${this.children.map(x => x.render())}
            </div>`,
            this.target
        );
    }
}

const tabs = [
    { id: "charts", name: "Charts", checked: true },
    { id: "elections", name: "Elections" },
    { id: "layers", name: "Layers" }
];

const tabMenu = new Tabs(tabs);
