import { html } from "lit-html";

const template = (tools, selectTool) => html`
<fieldset>
<legend>Tools</legend>
${tools.map(
    tool => html`
<input type="radio" id="${tool.id}" name="tool" value="${
        tool.id
    }" @input=${selectTool} ?checked=${tool.active}>
<label for="${tool.id}">${tool.name}</label>
`
)}
</fieldset>
`;

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

        this.selectTool = this.selectTool.bind(this);
        for (let tool of tools) {
            if (tool.active === true) {
                this.activeTool = tool.id;
            }
        }
    }
    selectTool(e) {
        const toolId = e.target.value;
        this.toolsById[this.activeTool].deactivate();
        this.toolsById[toolId].activate();
        this.activeTool = toolId;
        this.render();
    }
    view() {
        return template(this.tools, this.selectTool);
    }
}
