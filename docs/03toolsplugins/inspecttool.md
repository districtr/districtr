# Working on Tooltip! The Inspect Tool

The Inspect Tool was added between Tue. Jan. 15 and Wed. Jan. 16, 2019
by [@maxhully]. [@mapmeld] has continued maintenance of this file, with
additions by [@jenni-niels] in the realm of displaying [VRA] data.

## default class `InspectTool`

As an extension of the base [`Tool`] class, `InspectTool` has similar
construction, activation, deactivation and rendering functions. However,
it is a very different tool than the brushes as it must display tabular
data using a [`Tooltip`]. This is reflected in its construction.

### Construction

Known as `inspect` and `Inspect` in its ID and name, base class `Tool`
is invoked in the typical way, with an img-tag string indicating the 
location of its icon. However, its constructor has many new requirements
that stem from the [`State`] plan/context.
- `state.units`
- `state.columnSets`
- `state.nameColumn`
- `state.unitsRecord`
- `state.parts`

First, `this.columnSets` is mindful of both 2018 and 2019 columns and
splits out the parameter `columnSets` for its instance variable. A new
`this.activeColumnSetIndex` is also set to 0. Within the constructor, 
a new `renderTooltipContent` function is created with the objective of
passing features to the map `TooltipContent` renderer.

Instance variable `this.layer` is assigned the parameter `units`, a
new [`ToolTip`] is created with `units` and the `renderTootipContent`
function and is set as the instance `this.tooltip`. Finally,
`this.options` is assigned a new `InspectToolOptions` class and the
`this.changeColumnSetByIndex` function is bound to the instance. 

### Activation and Deactivation 

This tool is activated and deactivated in a similar way using its base
object `Tool`. In addition, the `inspect-tool` class is added to the 
canvas of the [`map`] and the `this.tooltip` is also activated. 

When deactivated, each of the three pieces above are either deactivated
or removed from the canvas class list. 

### Column Indexes

Different column sets can be loaded into the tooltip by changing
`this.activeColumnSetIndex` with the `changeColumnSetByIndex(i)` setter.
All data in the active column set can be returned by
`getActiveColumnSet()`. 

## The `InspectToolOptions` class 

An options class for the inspectTool can be created by passing itself
into the `InspectToolOptions` constructor. This object carries two
instance methods, `this.inspectTool` and `this.changeRadius`, a bound
function.

Triggered by the UI, `changeRadius(e)` stops the event's propagation, 
retrieves the slider value, applies this to the
`inspectTool.tooltip.radius` and rerenders the Toolbar. 

Within the [toolbar], the `render()` function creates a div class
`.ui-option` with a legend that displays "Tooltip Data." A `Select`
class UI component  is called to render a selection of various
`columnSet`s available. Finally, a `BrushSlider` element titled
"Spotlight Size" is created to render the UI for changing the tooltip
radius. This is all described as part of the [Options Container].

# #

[Return to Main](../README.md)

- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)

- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - Previous: [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@jenni-niels]: http://github.com/jenni-niels

[`State`]: ../01contextplan/state.md

[`map`]: ../02editormap/map.md

[`Tool`]: ../03toolsplugins/tool.md
[toolbar]: ../03toolsplugins/toolbar.md
[Options Container]: ../03toolsplugins/optionscontainer.md

[VRA]: ../../06charts/vra.md

[`Tooltip`]: ../04tooltip/tooltip.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
