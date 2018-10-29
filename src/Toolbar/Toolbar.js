import { html, render } from "lit-html";

export default class Toolbar {
    constructor(tools, activeTool, target) {
        this.tools = tools;
        this.activeTool = activeTool;
        this.target = target;

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
            ${this.tools.map(
                // This is a hack to get the transition to look the way I want
                // it to
                tool =>
                    tool.options !== undefined ? tool.options.render() : ""
            )}
            </section>
            <section>
            <legend>Population</legend>
            <div id="tally"></div>
            </section>`,
            this.target
        );
    }
}
