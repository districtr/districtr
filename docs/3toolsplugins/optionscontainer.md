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

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](./toolbar.md)
- [The Tools-Plugin prevails](./toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./tool.md)
  - [Brush and Erase Tools](./BrushEraseTools.md)
  - [Inspect Tool](./inspecttool.md)
- [Popups a la Modal](./modal.md)
- Previous: [The top-bar Menu](./topmenu.md)
- Next: [UIStateStore](./uistatestore.md)
- [Actions and Reducers](./actionsreducers.md)
- [A List of UI and Display Components](./uicomponents.md)
- [Tabs and Reveal Sections](./sections.md)
