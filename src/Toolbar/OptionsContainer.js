import { html } from "lit-html";

export default activeTool => html`
<section id="tool-options" class="${
    activeTool.options !== undefined ? "active" : ""
}">
${activeTool.options !== undefined ? activeTool.options.render() : ""}
</section>
`;
