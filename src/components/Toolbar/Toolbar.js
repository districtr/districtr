import { html, render } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import UIStateStore from "../../models/UIStateStore";
import reducer from "../../reducers";
import Tabs from "../Tabs";
import OptionsContainer from "./OptionsContainer";

export default class Toolbar {
    constructor(tools, activeTool, tabs, menuItems, initialUIState) {
        this.tools = tools;
        this.activeTool = activeTool;
        this.tabs = tabs;

        this.render = this.render.bind(this);
        this.selectTool = this.selectTool.bind(this);

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

        this.store = new UIStateStore(reducer, initialUIState);
        this.store.subscribe(this.render);
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
                        ${
                            repeat(
                                this.tools,
                                tool => tool.id,
                                tool => tool.render(this.selectTool)
                            )
                        }
                    </div>
                    <div class="icon-list">
                        ${this.menuItems.map(item => item.render())}
                    </div>
                </div>
                ${OptionsContainer(activeTool)}
                ${Tabs(this.tabs, this.store.state, this.store.dispatch)}
            `,
            target
        );
    }
}
