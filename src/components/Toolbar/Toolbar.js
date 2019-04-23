import { html } from "lit-html";
import { repeat } from "lit-html/directives/repeat";
import { actions } from "../../reducers/toolbar";
import Tabs from "../Tabs";
import OptionsContainer from "./OptionsContainer";

export default class Toolbar {
    constructor(store) {
        this.tools = [];
        this.toolsById = {};

        this.menuItems = [];

        this.tabs = [];

        this.render = this.render.bind(this);
        this.selectTool = this.selectTool.bind(this);

        this.store = store;
    }
    get activeTool() {
        return this.toolsById[this.store.state.toolbar.activeTool];
    }
    selectTool(toolId) {
        if (this.activeTool) {
            this.activeTool.deactivate();
        }
        this.toolsById[toolId].activate();
        this.store.dispatch(actions.selectTool({ id: toolId }));
    }
    addTab(tab) {
        this.tabs.push(tab);
    }
    addTool(tool) {
        if (tool.options !== undefined) {
            tool.options.renderToolbar = this.render;
        }
        this.toolsById[tool.id] = tool;
        this.tools.push(tool);
    }
    setMenuItems(menuItems) {
        this.menuItems = menuItems;
    }
    render() {
        return html`
            <div class="toolbar-top">
                <div class="icon-list">
                    ${repeat(
                        this.tools,
                        tool => tool.id,
                        tool => tool.render(this.selectTool)
                    )}
                </div>
                <div class="icon-list">
                    ${this.menuItems.map(item => item.render())}
                </div>
            </div>
            ${OptionsContainer(this.activeTool)}
            ${Tabs(this.tabs, this.store.state, this.store.dispatch)}
        `;
    }
}
