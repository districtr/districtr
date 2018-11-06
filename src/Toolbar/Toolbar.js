import { html, render } from "lit-html";
import { main } from "../index";
import OptionsContainer from "./OptionsContainer";
import Tabs from "./Tabs";

export default class Toolbar {
    constructor(tools, activeTool, children) {
        this.tools = tools;
        this.activeTool = activeTool;
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
            <button class="new-map-button"
            @click=${main}>
            New Map
            </button>
            </div>
            ${OptionsContainer(activeTool)}
            ${tabMenu.render()}
            <div id="tab-section-body">
            ${this.children.map(child => child())}
            </div>`,
            target
        );
    }
}

const tabs = [
    { id: "charts", name: "Charts", checked: true },
    { id: "elections", name: "Votes" },
    { id: "layers", name: "Layers" }
];

const tabMenu = new Tabs(tabs);
