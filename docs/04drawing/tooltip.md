# The Tooltip Brush

The Tooltip Brush is a special brush used with the [`InspectTool`], or
in community mode, where information on the hovered units is displayed.
Like [`Brush`], it extends [`HoverWithRadius`] and extends its parent
class functions. 

## Construction

A `Tooltip` requires the relevant [`layer`], `content` for display and
`radius`, which defaults to 1. The `layer` and `radius` is sent to the
base class as part of the `super` construction. Argument `content` is
applied to instance variable `this.content`, an object of
`ToolTipContent` type. Finally, unique for `Tooltip`, a `this.container`
instance variable is created set to a new document div element. This is
appended to the container of its `layer`'s mapboxgl [`map`], that is, it
creates a leaf div as sibling of the main mapbox gl `map`.

## Activation and Mouse Events

Much of the `Tooltip` simply extends the functionality of its base
classes. `activate()` only calls `super.activate()` whereas
`deactivate()` deactivates its super, turns `hoverOff`, sets
`this.visible` to false and renders itself.

> Unfortunately, `this.visible` isn't initialized in the constructor.

`onMouseMove(e)`, the `Tooltip` keeps track of its mouse point with
`this.x` and `this.y` (which also aren't initialized in the
constructor.) These are gleamed from event `e`. If there are no
features, we wait a bit an call `this.hideIfNoFeatures`. Otherwise, the
tool tip is visible and rendered. `hideIfNoFeatures()` simply sets the
`Tooltip`'s visibility to false if there are no features and is written
here as a timeout callback. 

On mouse leave, the super is called, the visibility is set to false and
the tooltip is set to render. 

## Rendering

The trick to loading information in the tooltip occurs when
`this.hoveredFeatures` is sent to `this.content`, which is used to
create a display through the `TooltipContent` function. Within the div
in `this.conainer`, an aside tag is created, which must be told how it
is rendered. We do this using two lit-html functions `classMap(...)`,
which sets the class, i.e. whether hidden or not, and and
`styleMap(...)` to set the position.

## `TooltipContent`

Originally written by [@maxhully] on Mon. Apr. 29, 2019,
`ToolTipContent` is a function that takes a list of features and creates
a graphic box used for display.

When a `Tooltip` is created by `InspectTool`, a `ToolTipContent` object,
the recepient within `Tooltip` of `this.hoveredFeatures`, is also
created. It is constructed with the following parameters.
- `features`,
- `columnSet`,
- `nameColumn`,
- `pluralNoun`,
- `parts`, 
- `columnSetIndex`.

This function handles the calculation of the total and the sum over all
columns of the entire list of hovered features. There's also alternative
ways of handling elections, alternative sources of population and
different 2018/2019 totals.

Finally, to render, it returns an html that combines both the
`tooltipHeading(...)` and a [`HorizontalBarChart(...)`].

# #

[Return to Main](../README.md)
- [Hovering over the Map](../04drawing/hover.md)
- [Painting and Erasing with Brush and Community Brush](../04drawing/brush.md)
- Previous: [Undo and Redo](../04drawing/undoredo.md)
- Next: [Checking for Contiguity](../04drawing/contiguity.md)

[@maxhully]: http://github.com/maxhully

[`layer`]: ../02editormap/layer.md
[`map`]: ../02editormap/map.md

[`InspectTool`]: ../03toolsplugins/inspecttool.md

[`Brush`]: ../04drawing/brush.md
[`HoverWithRadius`]: ../04drawing/hover.md

[`HorizontalBarChart(...)`]: ../06charts/populationbarchart.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA