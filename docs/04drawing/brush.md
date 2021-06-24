# The Brush

The `Brush` object we use in the map is the core way we paint and erase
features on a map. It is responsible for hovering over a feature and 
communicating with mapbox about coloring or de-coloring these features,
the principal way we assign units to destricts.

Loaded by [`tools-plugin.js`], a [`Brush`] is turned on and off by the
[`Toolbar`]. In order to hover over features, it inherits from
[`HoverWithRadius` and `Hover`]. Finally, the brush object keeps track
of these actions so that users can undo or redo their changes.

<img src="../pics/drawingbasics.png" width=50%>

## The `Brush` class in [`src/map/brush.js`]
The `Brush` made its debut on Tues., Oct. 23, 2018, written into
districtr by [@maxhully]. The next week, on Oct. 29, erasing with the
brush was enabled. 

### Construction

A `Brush` object is constructed with a [`Layer`], `radius` and `color`.
The `Layer` is the relevant [map] layer the Brush acts upon, the
`radius` is the initalized value of a parameter related to selecting
features in batches. A brush, like in real life, paints one `color` at a
time.

> Remember: We interact with features through their physical properties.
Thus, when we assign a unit to a district, we're simply coloring that
unit with a color of our choice. We interpret same-colored units as 
a single district later. 

A listing of instnace variables are as follows...
- `this.layer` and `this.radius` are passed up to the base classes
- `this.color` saves the parameter
- `this.coloring` tells us if the brush is coloring or hovering
- `this.county_brush` tells us if we are coloring by county
- `this.locked` tells us if we can overpaint colored features
- `this.changedColors` is a set of colors whose features may have been
painted

Though not defined on construction, `this._previousColor`,
`this.erasing`, `this.cursorUndo` and `this.trackRedo` are also instance
variables created later. [Undo and Redo] operations are detailed in 
this article and later in this chapter.

As a user-interface, each `Brush` instance keeps a collection of
`this.listeners` tied to specific actions...
- `colorend` signals when we're done coloring 
- `colorfeature` signals when we've colored a feature
- `colorop` related to mouse actions, undoing and redoing  
- `undo` and `redo` signals when actions were undone or redone. 

Finally, we bind instance methods `onMouseDown`, `onMouseUp`, `onClick`,
`onTouchStart`, `prepToUndo`, `undo`, `redo` and `clearUndo` to each
instance and clear the undo/redo stack with `this.clearUndo()`.

### Coloring and Erasing

The primary responsibility of the `Brush` and, indeed, the entire
districtr system, is the ability to select precinct or census units and
collecting them together. We do this by coloring them. A brush carries a
color one at a time. Thus, after intialization, a brush's `this.color`
can be set anew by `setColor(...)`.

When erasing is desired, we call `startErasing()` which stores the
current color in `this._previousColor`, sets `this.color` to null and
`set.erase` to true. In essence, we "erase" a district by painting
units with the null color. When we're done, we can call `stopErasing()`
which restores the original brush color.

The responsibility for coloring units rests with function
`colorfeatures` and the beastly `_colorfeatures`. When painting units,
these functions take into account whether we are painting by counties,
whether painted features are locked and whether we are painting or
erasing. For instance, depending on whether `this.locked` is true or
false, we filter for allowed paintable features, i.e. units. Sometimes,
we allow only units that are blank. Conversely, we can include any unit
null or a different color than the current brush to be reassigned.

> Features under locked-mode can't be recolored but can still be erased.
Features under unlocked-mode can be both recolored and erased. 
 

The main action occurs in `_colorFeatures` once it is given a filter.
Here, `seenFeatures` and `seenCounties` are a vital sets that keep track
of our work. 

First, we add the brush's color to `this.changedColors` to signal that
we have made changes with this color. Then, we iterate through all
filtered counties. If we happened to select counties, we color
these counties through `layer.setCountyState(fips)` using the county's
fips codes and trigger the `colorop` listeners. Finally, we trigger the
`colorend` listeners.

As we iterate through features, we consider whether they're eligible for
painting using the filters described above. An individual feature
ineligble for recoloring is passed into the layer `setFeatureState(...)`
only to indicate that it was hovered upon. 

If an individual feature is eligible to be recolored and we're working
with single or batches of features, this feature is added to
`seenFeatures` and functions listening for `colorfeature` are triggered
with the feature and the brush's color sent as parameters.

The change is then registered to the undo/redo stack, `this.trackUndo`,
`brush.color` is added to `this.changedColors`, again, and finally, the
color change is sent to Mapbox using `layer.setFeatureState(...)`.

If the brush is set to paint by county, the feature's county is recorded
in `seenCounties`.

### User Interaction

Just as its ultimate base class `Hover` handles user events, `Brush`
must extend this tool to include the possibility of coloring in
features. Method `hoverOn(features)` sends the features to
`colorFeatures()` if the Brush is on. 

As the mouse hovers over the features, it waits for a user's click. This
triggers a new `onClick(e)` sequence which resets `this.changedColors`,
prepares the undo stack with `prepToUndo` and `this.colorfeatures()`
which uses the `this.hoveredFeatures` collected by `hoverOn(features)`,
as outlined by the based class. Finally, unless we're painting by
county, functions that listen to `colorop` events are triggered. 

> Only two functions listen for the `colorop` trigger: one written in 
`tools-plugin.js` that uses `this.changedColor` and another in
`UndoRedo.js` that resets Undo/Redo functions if a user makes new edits
after undoing previous actions.

It is also possible to paint districts by dragging the mouse around.
Functions `onMouseDown(e)`, `onMouseUp()` and `touchStart(e)` handles
the initialization of `this.changedColors`, and `this.prepToUndo` and
the addition and removal of window listeners related to dragging. Most
important, these functions toggle `this.coloring` which `hoverOn` uses
to determine whether to paint features that are hovered on.

### Undoing and Redoing

<img src="../pics/undoredo.png" width=50%>

The ability to undo and redo functions was introduced in December of
2019 by [@mapmeld]. More details on the [Undo and Redo] UI button can be
found later in the chapter.

For now, it is the responsibility of the brush
object to keep track of user actions through instance
variables `this.cursorUndo` and `this.trackUndo`. These variables
are initialized in class method `this.clearUndo` such that...
- array `this.trackUndo` is initialized with a single two-value
object...
 - `color: "test"`
 - `initial: true`
- ...and that integer `this.cursorUndo` is set to 0.

Each object in `this.trackUndo` contains an object for each amended
feature within a user's action such that value at key `feature.id` is
an object with...
- `properties: feature.properties`, to keep track of population, etc
- `color: String(feature.state.color)` to keep track of new color. The
addition of objects in `this.trackUndo` occurs in
`this._colorFeatures()`, using either a list of hovered features or
`Layer.setCountyState(...)`.

Triggered together with `this.colorFeatures()` when one performs a
click or mousedown is `prepToUndo()` whose responsibility is to fine
tune undo/redo behavior. First, if we've undone several times and
perform new actions, then `this.trackUndo` discards subsequent actions. 
We also ensure that this array functions as a queue, removing older
actions as new actions are added limiting the depth of undo actions to
20. Finally, a placeholder object, `{color: this.color}` is added and 
`this.cursorUndo` is reset.

Finally, we're ready to recieve calls made by `Toolbar/UndoRedo.js`,
which serves to trigger `this.undo()` or `this.redo()`.

Within these functions, the `this.trackUndo` object at a specific
`this.cursorUndo` is known as an `atomicAction`. There are two kinds:
one  that has one object containing only a single key-value pair `color`
and another that has multiple `key-value` pairs for each `feature.id`
changed during a user's action.

In the first case where only a single `color` object is stored, if this
color is non-null, it is added to the `this.colorsChanged` and the undo
step has finished. 

If there are multiple `featureId` key-pair objects in an `atomicAction`,
each `featureId` is colored or erased based on its color during that
`atomicAction`. and the color is added to `this.changedColors`.

Finally, the cursor position is reset, listeners subscribed to
`colorend` or `colorop` are updated with the list of changed colors, the
changed colors list is reset and listeners subscribed to `undo` are
alerted to the cursor position. 

If there are actions available for redoing, then the `redo()` function
can be triggered, which will perform the actions above in reverse.
    
### Brush Activation and Deactivation

If the mouse sits upon the map, then activating and deactivating
the `Brush` is as simple as activating and deactivating the object
through its base class `Hover`. If the mouse is away from the map,
say, when it clicks on the Toolbar, certain map behaviors are toggled.

When activated...
- `brush-tool` is added to the map canvas class list
- Map properties `dragPan`, `touchZoomRotate` and `doubleClickZoom` are
disabled
- `this.onClick` is bound to its layer
- `this.touchstart` and `this.mousedown` are bound to the map.

Deactivation applies the above in reverse.

Finally, an `on(event, listener)` function registers callback functions
to events in `this.listeners`. 

# Community Brush

The `CommunityBrush`, found in `CommunityBrush.js` is mostly the same as
regular `Brush` but takes into account that coi's can overlap. For
instance, when a unit belongs to multiple communities, `CommunityBrush`
tries a strategy to blend the colors together.

# # 

## Suggestions

- It's easier to get one's mind around an object when its instance 
variables are defined at the start. This is so for
`this._previousColor`, `this.erasing`, `this.cursorUndo` and
`this.trackRedo`.

- Checking if `feature.state.color` is null or undefined or
`isNan(...)` is redundant, they are equivalent statements
- Much effort is done to ensure that the color type is `Number`.
What is the reason it would ever be passed around as a string? We could
guarantee that the color is a Number throughout.

- Functions `colorfeatures(...)` works in service to the heftier
function `_colorfeatures(...)`. Could we just rename these two such
that the first function, which selects the appropriate filter, is a
helper instead of a gateway?

- The sprawling function `_colorFeatures(...)` investigates both
individual units and whole counties. Could we separate painting features
and painting counties into separate functions?

- Every time `this.changedColors` is cleared, it is pointed to a 
`new Set()` javascript object, which starts out empty. This creates
many `Set` objects with each you. Though the memory savings on reusing
the same object are miniscule, wouldn't it be clearer to use function 
`clear(...)` on the original object?

# # 

[Return to Main](../README.md)
- Previous: [Hovering over the Map](../04drawing/hover.md)
- Next: [Undo and Redo](../04drawing/undoredo.md)
- [The Tooltip Brush](../04drawing/tooltip.md)
- [Checking for Contiguity](../04drawing/contiguity.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[map]: ../02editormap/map.md
[`Layer`]: ../02editormap/layer.md

[`tools-plugin.js`]: ../03toolsplugins/toolsplugin.md
[`Toolbar`]: ../03toolsplugins/toolbar.md

[`Brush`]: ../04drawing/brush.md
[`HoverWithRadius`]: ../04drawing/hover.md
[`HoverWithRadius` and `Hover`]: ../04drawing/hover.md

[`Toolbar/UndoRedo.js`]: ../04drawing/undoredo.md
[Undo and Redo]: ../04drawing/undoredo.md

[`src/map/brush.js`]: ../../src/map/brush.js`

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA