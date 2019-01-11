import { html, render } from "lit-html";
import Tabs from "../Tabs";
import OptionsContainer from "./OptionsContainer";

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
                    <div class="icon-list">
                        ${this.menuItems.map(item => item.render())}
                    </div>
                </div>
                ${OptionsContainer(activeTool)} ${this.tabs.render()}
            `,
            target
        );
    }
}
