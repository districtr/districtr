import { html } from "lit-html";

const template = (tools, selectTool) => html`
<fieldset class="icon-list">
<legend>Tools</legend>
${tools.map(
    tool => html`
    <div class="icon-list__item">
    <label>${tool.name}</label>
    <input
        type="radio"
        id="tool-${tool.id}"
        name="tool"
        value="${tool.id}"
        @input=${selectTool}
        ?checked=${tool.active}
    >
    <div class="icon-list__item__radio"></div>
    <i class="material-icons">${tool.icon}</i>
    </div>`
)}
</fieldset>`;

export default class ToolSelector {
    constructor(tools, render) {
        this.tools = tools;
        this.render = render;

        this.toolsById = tools.reduce(
            (lookup, tool) => ({
                ...lookup,
                [tool.id]: tool
            }),
            {}
        );

        this.handleToolSelect = this.handleToolSelect.bind(this);

        for (let tool of tools) {
            if (tool.active === true) {
                this.activeTool = tool.id;
            }
        }
    }
    handleToolSelect(e) {
        const toolId = e.target.value;
        this.selectTool(toolId);
    }
    selectTool(toolId) {
        this.toolsById[this.activeTool].deactivate();
        this.toolsById[toolId].activate();
        this.activeTool = toolId;
        this.render();
    }
    view() {
        return template(this.tools, this.handleToolSelect);
    }
}
