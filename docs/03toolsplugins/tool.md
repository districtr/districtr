# The `Tool` Class

Users interact and edit maps and communities using tools. These
tools are listed at the top of the [`Toolbar`] and are loaded according
to the current [problem/context]. This occurs when the `edit.js` view
is loaded. A list of [plugins], functions which interact with tools (and
provides the user information and Ui), is called by the [`Editor`].
When a plugin is called, instances of each tool is created and is
responsible for rendering themselves in the tool menu and proceed with
different functionality allowing the user to edit the [map]. 

Every tool extends the `Tool` class and take in a variety of parameters
depending on their complexity. For instance, a [`Brush`] instance is
often included as a argument, allowing the tool to edit inside the
mapboxgl `map` canvas. 

# `/src/components/Toolbar/Tool.js`
The `tool` class defines simple construction, activation, deactivation
and rendering of each tool and is the base class for all tools to
follow. It was originally written by [@maxhully] on Tues., Oct. 23,
2018. The current version was moved into the `src/components/` folder
with the entire `Toolbar/` folder on Fri. Jan. 11, 2019 and has been
maintained lightly by [@mapmeld] since. 

## The `Tool` Class
Each Tool extends the `Tool` class, which guarentees that each tool has
the following four operations. 

### Contstruction
A tool is constructed with the following parameters, which define
initial instance variable.
- `this.id`, a simple id name used internally
- `this.name`, a display-ready name to be displayed externally
- `this.icon`, a lit-html img tag whose src is a svg file to be display
in the toolbar
- `this.hideMe`, an option to display or hide the tool in the toolbar.

In addition, a final instance variable, `this.active`, which signals
that the tool is in active use, is set by default to `false`. 

### Activation and Deactivation 

The `activate()` function sets `this.active` to `true`. Since the tool
is rendered in the toolbar as part of a radio list, this function also
attempts to try to find the tool's rendering in the document, whose id
is akin to `#tool-id`, and makes sure it is checked. 

The `deactivate()` function does the reverse. `this.active` is set to 
`false`. Since the tool is represented by a radio-button, its box is
by definition unchecked when another tool's box is checked `true`. 

### Rendering

As part of the `lit-html` framework, each `Tool` defines a render
function, which takes a `selectTool`, typically the `toolbar.selectTool`
function as a parameter. 

First, html is only rendered if `this.hideMe` is false. If so, each
`Tool` creates a div of class `.icon-list__item` with a title carrying
`this.name`.

Within this div class, a label is given the same display name.
Ultimately, this `Tool` is a radio-type input with the following
parameters...
- The `type` is always `"radio"`
- The `id` for the input is akin to `tool-id`
- Its `name` is always `"tool"`
- Its `value` is its `id`
- On change, `selectTool(this.id)` serves as a callback function that
instructs `Toolbar` to recognize this Tool as active, by its id.
- Whether it is considered `checked` depends on if the `Tool` is active.

Finally, a div of class `.icon-list__item___radio` is created and the
instance `icon` is depicted, and the div class `.icon-list__item` is
closed.

# The `Pan` Example

The `Pan` tool, which corresponds to `mapboxgl`'s default drag and pan
functionality is defined here with the following code, in its entirety.
```
import { html } from "lit-html";
import Tool from "./Tool";

export default class PanTool extends Tool {
    constructor() {
        const icon = html`<img src="/assets/Icons_Pan_grey.svg" alt="Pan Map"/>`;
        super("pan", "Pan", icon);
    }
}
```
This is the most basic a tool can get. Simply, we ensure that its svg
icon can be found. Then, the `Tool` class is created with `pan` as its
id and `Pan` as its name. `hideMe` is not listed and is undefined and
therefore computes as `not true` when it is rendered. 

# All the Tools

So far, only five tools have been defined.

- `PanTool`, described above, allows for dragging and panning.
- [`BrushTool`] draws colors upon the units of a map with a `brush`
- [`EraserTool`] removes colors of the units of a map with a `brush`
- [`InspectTool`] allows users to inspect tabular data for each map unit
- [`LandmarkTool`] draws landmarks when drawing communities of interest.

# #

### Suggestions
Should we set a default `hide-me` value `false` in the `Tool`
constructor to be clear?

# #

[Return to Main](../README.md)
- Here: [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - Next: [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
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

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[problem/context]: ../01contextplan/plancontext.md

[`Editor`]: ../02editormap/editor.md
[map]: ../02editormap/map.md

[`Toolbar`]: ../03toolsplugins/toolbar.md
[plugins]: ../03toolsplugins/plugins.md
[`Brush`]: ../04drawing/brush.md

[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[`EraserTool`]: ../03toolsplugins/brusherasetools.md
[`InspectTool`]: ../03toolsplugins/inspecttool.md
[`LandmarkTool`]: ../05landmarks/landmarktool.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA