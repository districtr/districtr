import { html, render } from "lit-html";
import OptionsContainer from "./OptionsContainer";
import Tabs from "./Tabs";

export default class Toolbar {
    constructor(tools, activeTool, tabs, menuItems) {
        this.tools = tools;
        this.activeTool = activeTool;

        this.render = this.render.bind(this);
        this.selectTool = this.selectTool.bind(this);

        this.tabs = new Tabs(tabs, this.render);
        this.menuItems = menuItems;

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
        const target = document.getElementById("toolbar");
        if (target === null) {
            return null;
        }
        const activeTool = this.toolsById[this.activeTool];
        render(
            html`
                <div class="toolbar-top">
                    <div class="icon-list">
                        ${this.tools.map(tool => tool.render(this.selectTool))}
                    </div>
                    ${this.menuItems.map(item => item.render())}
                </div>
                ${OptionsContainer(activeTool)} ${this.tabs.render()}
            `,
            target
        );
    }
}
