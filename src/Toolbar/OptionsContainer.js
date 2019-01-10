import { html } from "lit-html";

export default activeTool => html`
    <section
        class="toolbar-section tool-options ${
            activeTool.options !== undefined ? "active" : ""
        }"
    >
        ${activeTool.options !== undefined ? activeTool.options.render() : ""}
    </section>
`;
