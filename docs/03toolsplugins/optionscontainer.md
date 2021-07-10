# Options Container

The Options Container is very simple. It's a function,
`OptionsContainer(activeTool)` called every time the [`Toolbar`] is
rendered. The `OptionsContainer.js` file is displayed in its entirety
below.
```
import { html } from "lit-html";

export default activeTool => html`
    <section
    class="tool-options ${activeTool.options !== undefined ? "active" : ""}">
        ${activeTool.options !== undefined ? activeTool.options.render() : ""}
    </section>
`;
```

When `Toolbar` is rendering, it passes its `this.activeTool` to
`OptionsContainer` such that it renders in the document under the nav
section inside the div class `.toolbar`. 

`OptionsContainer`'s only function is to render a section of class
`tool-options` that also keeps track whether it's active or inactive by
assigning a class `.active`. Then, if the [tool]'s options exist, that
options object is told to render, displaying various [buttons and
sliders] that allow the user to control their chosen tool.

# #


[Return to Main](../README.md)
- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - Previous: [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - Next: [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)

- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[`Toolbar`]: ../03toolsplugins/toolbar.md
[tool]: ../03toolsplugins/tool.md
[buttons and sliders]: ../03toolsplugins/uicomponents.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
