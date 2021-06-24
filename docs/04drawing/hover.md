# Hover and Hover with Radius

In order to be able to brush or display tooltips, we should be able to
hover over a map's features with the mouse and demonstrate that we can
select a feature one at a time or within an area of radius. Thus,
[`Brush`] and [`Tooltip`] inherit from the `HoverWithRadius`, which
inherits from  `Hover`.

This was developed as part of `Brush` functionality by [@maxhully].

## [`src/map/Hover.js`]

`Hover.js` holds both the `Hover` and `HoverWithRadius` classes. The
`Hover` ensures we can hover over a single feature and `HoverWithRadius`
extends this class to include features within a certain radius. Before
we can click or paint features, we must be able to hover over them one
at a time. 

## `export class Hover`

A `Hover` object requires a [`layer`]. Common `paint/erase` brush tools
are tied to layer `state.units`. This layer is created when `edit.js` 
creates the page's [`State`] derived out of the units in a loaded
 `plan/context.` As part of initializing the `State`,
 `initializeMapState` is called and uses map's `addLayer` to create a
`state.units` layer. This layer is sent to `Brush` when it is created in
tools-plugin. `Brush` extends `Hover` which requires this layer. 

### Construction  

With the `layer` parameter set as this layer's instance variable
`this.layer`, other instance variable are created.
- `this.hoveredFeatured`, the relevant feature, initialized to `null`.
- `this.deactivatedHover`, which tells us if this hover is activated or
not

Finally, `onMouseMove`, `onMouseLeave` and `hoverOff` action callbacks
are bound to instances of this class.

Three pairs of instance methods provide the core functionality for any
`Hover` objects and its inheritors. 

### `hoverOn` and `hoverOff` 

Outlined by Mapbox, this pair of functions highlight the primary way we
interact with features on the map. **We interact with units on a map
by manipulating their displaay features, particularly color.** This is 
achieved by using the Mapbox feature `setFeatureState(...)`. 

When we hover on features, we store them in each Hover instances's
`this.hoveredFeatures`. If this `Hover` object is activated, the
feature's layer calls `setFeatureState(...)`, which calls on Mapbox to
add `hover: true` to the feature's properties. This is how we tell
Mapbox that certain features are hovered over such that it can apply
special behaviors.

`HoverOff` does the reverse, using `setFeatureState(...)` to set a
feature's `hover` to false and clears the `this.hoveredFeatures` array
to empty. 
 
### `onMouseMove(e)` and `onMouseLeave()`

We hover these features using a mouse, thus we have to tie mouse events
to the hover functions above, whose responsibliity is to inform Mapbox.
With `onMouseMove(e)`, the event `e` returns the relevant features
whereas `onMouseLeave()` requires no event, and `this.hoveredFeatures`
is cleared. These functions will be redefined as `Hover` is extended. 

### `activate(mouseover)` and `deactivate(mouseover)`

A page's`Toolbar` is responsible for activating and deactivating
each of the tools one by one, including the `BrushTool`, which is
tied to the map `Brush`, which ultimately inherits from `Hover`. 

Each function takes a `mouseover` event as a parmeter. If our mouse
happens to be over the layer when we activate or deactivate the `Hover`,
then only `this.deactivateHover` is toggled. If we happen to be outside
the map layer, then the `onMouseMove(e)` and `onMouseLeave()` callbacks
we defined above are applied on the map layer which listens for mouse
or touch actions. 

# The `HoverWithRadius` Class

The brush and tooltip tools we use extend the `HoverWithRadius` class,
which extends the `Hover` class to highlight multiple features. It does
so with the addition of instance variable `this.radius` and function
`boxARound(point, radius).` A `point` is supplied by event `e`.

> Throughout districtr, we refer to the size of a brush as a `radius`.
However, it is more accurate to refer this to a 'half-side', as a box
rather than circle is used to select features around a point. 

This northeast-southwest is sent to the Mapbox, which returns features
from a layer within this box. 

# #

### Suggestions
- Within districtr units generally refer to the base precincts or census
areas that we use to build districts. However, within the code base,
`units` sometimes refers to these areas in the plan/context and
sometimes to the mapbox `layer`. Maybe using `units` and a new title
"unitsLayer" consistently would be less confusing.
- What is a State? A dizzying notion. Is it...
  - The State political unit?
  - The UIState `state` object?
  - The FeatureState, as in the condition properties of a feature?  

# # 

[Return to Main](../README.md)
- Next: [Painting and Erasing with Brush and Community Brush](../04drawing/brush.md)
- [Undo and Redo](../04drawing/undoredo.md)
- [The Tooltip Brush](../04drawing/tooltip.md)
- [Checking for Contiguity](../04drawing/contiguity.md)

[@maxhully]: http://github.com/maxhully

[`State`]: ../01contextplan/state.md

[`layer`]: ../02editormap/layer.md

[`Brush`]: ../04drawing/brush.md
[`Tooltip`]: ../04drawing/tooltip.md

[`src/map/Hover.js`]: ../../src/map/Hover.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA