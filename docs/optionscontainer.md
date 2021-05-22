# Options Container

The Options Container is very simple. It's a function, `OptionsContainer(activeTool)`
called every time the `ToolBar` is rendered. The `OptionsContainer.js` is diplayed in
its entirety below.
```
import { html } from "lit-html";

export default activeTool => html`
    <section
        class="tool-options ${activeTool.options !== undefined ? "active" : ""}"
    >
        ${activeTool.options !== undefined ? activeTool.options.render() : ""}
    </section>
`;
```

When `Toolbar` is rendering, it passes its `this.activeTool` to `OptionsContainer` such
that it renders in the document under the nav section of inside the div class `.toolbar`. 

`OptionsContainer`'s only function is to render a secction of class `.tool-options` that
also keeps track whether it's active or inactive by assigning a class `.active`. Then,
if the tool's options exist, that options object is told to render, dislpaying the various
buttons and sliders that allow the user to control their tools. 
