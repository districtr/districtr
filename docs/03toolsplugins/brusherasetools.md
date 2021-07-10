# Brushing and Erasing with Tools
As described in [Tool], each of the five tools used by districtr users
to edit the [map] are extension of the tool class. `Pan` is a very
simple example, whereas the `BrushTool` is the workhorse for the entire
app. The `EraseTool` is similar, as it undoes any coloring performed by
the Brush Tool.

## src/components/Toolbar/BrushTool.js

The brush tool began life during the Mon., Oct. 23, 2018 refactor as
[@maxhully] was building out the concept of the `Tool`. Originally
placed with `Tools.js`, it was given its own file in January of 2019 and
has been maintained by [@mapmeld] since Dec., 2019. Its last update was
in late 2020. 

Remember, there's a difference between the map [`Brush`] object and this
`BrushTool` used in the [`Toolbar`]. This `BrushTool` requires a `Brush`
upon creation.

Finally, this file also defines the `BrushToolOptions`, `CountyBrush`
and `BrushLock` classes and the html code that carries the `BrushTool`
svg icon. 

## The `BrushTool` Class

The `BrushTool` Class is an extension of the base `Tool` class and is
created once, within `tools-plugin.js`. Since this plugin is always
loaded, the `BrushTool` is also always loaded, no matter if the user is
painting districts or outlining communities of interest. 

### Construction

The constructor for the `BrushTool` is more involved than the standard
constructor for a `Tool`. Required parameters include the map `Brush`, a
list of `color`s, which is usually a numbered list of the districts in a
[context/problem] and a separate class of options. When sent to the
`Tool` class, its `id` is known as `brush`, its name is  known as
`Paint` and its icon was defined before as a constant. Instance
variables `this.brush` and `this.colors` are taken by the parameters
whereas the options are used to create a new `BrushToolOptions` object
that serves as `this.options`.

Hotkeys are also defined. ctrl-z [undos] a brush operation, ctrl-shift-z
redoes it. 

### Extending Activation, Deactivation and Rendering

The `Tool` class functions for `activate()` and `deactivate()` are
extended by the `BrushTool`. When activated, the map `this.brush` tool
must also be told to  activate.

When deactviating, if the `this.brush` is a county brush, the county
option in `this.options` must also be toggled. Finally, `this.brush`
must be deactivated just as `this.tool` must deactivate. 

Since this tool is only responsible for nothing more complicated than
the rendering of itself in the toolbar, its renders largely the same as
the `Tool` would. 

## The `BrushToolOptions` class

The more exotic functionality of painting different colors is stored
separately in the `BrushToolOptions` class. When `option`, written in
`tools-plugin.js`, is sent to the `BrushTool`, a new `BrushToolOptions`
class is created as an instance variable.

### Construction

First, each `BrushToolOptions` requires a map `Brush`, a list of `colors`
and `options`, parameters from `BrushTool` that are passed in to create
`this.brush`, `this.colors` and `this.options` within this Options
class. `RenderToolbar` is also passed is defined always as `undefined`.

Currently, the `options` object contains keys like `community`,
`county_brush`, and `alt_counties` provided by `tools-plugin.js`.

Further class methods that are bound to each instance:
`this.selectColor`, `this.toggleCountyBrush`, `this.changeRadius` and
`this.toggleBrushLock`.

### Class Methods 

Both `selectColor(e)` and `changeRadius(e)` take input from the toolbar
as event `e`. In fact, these functions are triggered when the relevant
input is recieved from the user by the browser. 

In `selectColor(e)`, `e.target.value` holds the selection of a color
integer, sent to `this.brush.setColor(...)`. This function is also
written to handle cases when the  number of colors used can be added to,
dynamically, when drawing Communities of Interest.

In `changeRadius(e)`, input is recieved by a slider-bar in the Toolbar
[Options Container]. This value is used to change the painting radius
for the map `this.brush`. If `county_brush` is enabled, the map
`county_brush` referred to in `options` also has its radius updated.

Speaking of county brushes, `toggleCountyBrush()` allows us to turn the
ability to  paint in whole counties on or off. Each map `Brush` has the
option as to whether it paints counties or not. This function toggles
that state by swapping in and out  (activating and deactivating) between
`this.brush` and `this.options.county_brush`. The `#countyVisible`
checkbox is finally selected or deselected to match whichever `brush` is
in active use, which controls the display of the county layers border. 

Finally, `toggleBrushLock()` is a simple toggler that flips the map's
`this.brush.locked`. 

### Rendering

Different parts of the DOM must be rendered to match the options chosen
by this class. With the `activeColor` in mind, this includes the
`BrushColorPicker` and `BrushSlider`, `CountyBrush` and `BrushLock`
checkboxes, defined below, and the `UndoRedo` bar. 

## Additional UI Classes

`CountyBrush` is a simple `lit-html` type class that renders a checkbox
that takes into account the map `brush.county_brush` boolean property,
the `toggle_county_brush` function and whether there is an
`alt_counties` option (i.e. Louisiana Parishes.) 

`BrushLock` is a similar html checkbox renderer class that takes into
account the `brush.locked` boolean property, a toggle function and
options, to determine whether to label the locking of `communities` or
`districts` in the `Toolbar`

# #

# The `Eraser` Tool 
Parallel to the `BrushTool` is the `EraserTool`, which is much simpler. 

## The `EraserTool` Class
When evoking the `Tool` class in its construction, it is set to `eraser`
as id,  `Eraser` as display name and a const for its `icon`. Instance
variable `this.brush` is set to the brush parameter and a new
`EraserToolOptions(brush)` class is created for it `this.options`
instance variable. 

When activating and deactivating, not only must the underlying `Tool` be
activated and deactivated, so must `this.brush`, which is told
explicitly to `startErasing()` and `stopErasing()`. 

## The `EraserToolOptions` Class

When called by `EraserTool`, `EraserToolOptions` is constructed with a
map eraser `brush` and an undefined `renderToolbar`. While it bothers
with no selection of `color`, like the `BrushTool`, it minds an erase
radius with `changeRadius(e)` and is subject to undo and redo commands.
This slider is rendered as a `BrushSlider` with title `EraserSize` and
undo and redo buttons are rendered by `UndoRedo`.


### Suggestions 
- The const that stores the `BrushTool` icon is a function that takes in
parameters, but whose output is never changed. This must be vestigial
from an experiment where we changed the rendered tool icon based on
state.
- We should go ahead and set a default value for the `renderToolbar`
parameter in `BrushToolOptions`, as it is always set to `undefined` when
it is called. In fact, it is called in each of the `BrushToolOptions`
instance methods and is ultimately set to re-render the `Editor` when
the `BrushTool` is added by to the `Toolbar` by the `addTool(...)`
function. 
- Undo and Redo buttons handle recent erasing operations, but hot keys
are still bound only to recent brushing operations. 

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
  - Previous: [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - Next: [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[context/problem]: ../01contextplan/plancontext.md

[map]: ../02editormap/map.md

[`Pan`]: ../03toolsplugins/tool.md
[`Brush`]: ../04drawing/brush.md
[Tool]: ../03toolsplugins/tool.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[undos]: ../04drawing/undoredo.md

[Options Container]: ../03toolsplugins/optionscontainer.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
