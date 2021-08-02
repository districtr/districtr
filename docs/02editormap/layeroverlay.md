# Overlays 

Overlays are class instances that take one or more Layers and apply them
to the map. This is performed in either the [`DataLayersPlugin`] or the
`MultiLayersPlugin` when an `OverlayContainer` is created. This object
then creates the `Overlay`, a collection `Layer`s that are in turn
responsbile to the mapbox-gl [`map`].

## The Overlay Container

The `OverlayContainer`, found in [`src/layers/OverlayContainer.js`] and
its descendent, the `PartisanOverlayContainer` are responsible for both
creating the Overlay` object and its attendent [`Layers`] and the
User Interface surrounding the overlay, particularly the toggles that
show and hide the overlay and its layers and any drop down lists that
control which parameters and their columns to show.

The `OverlayContainer` is also responsible for selecting the color
palette with which to depict both the cosntituent layers and tables.
Each Overlay Container has this responsibility because colors can be
changed using the UI and because it is responsible for plotting any
charts or tables related to the data.

## Overlay 

The `Overlay` class, also found in the [`/Layers`] folder, is collection
of `Layer`s and as such takes `layers` as an argument, together with
`subgroup`, the current column whose data is depicted, and a
`defaultColorRule`. These are set as instance variables together with
`this.visible`, default to false and `this._currentLayerIndex`, default
to 0. Thus, instance variables include...
- `this.layers`
- `this._currentLayerIndex`
- `this.colorRule`
- `this.visible`

Many of the helper functions in this file is also bound to instances
of this function including...
- `currentLayer()`, which returns the layer at `this._currentLayerIndex`
- `setSubgroup(subgroup)`, sets a new subgroup data column
- `setColorRule(colorRule)` changes the color rule used in the map 
- `show()`, which shows the layer on the map by
    - resetting all layers to 0 with `this.hide()`
    - repaints the overlay 
- `hide()`
- `repaint()`

> Overlays can shade features in a `Layer` or shade overlapping circles
in a related `Layer`. 

# #

[Return to Main](../README.md)
- [How is the Districtr Editor page loaded?](../02editormap/initialization.md)
- [edit.js and the Editor Object](../02editormap/editor.md)
- [The Map Object](../02editormap/map.md)
- [Adding Layers](../02editormap/layer.md)
- Previous: [Number Markers](../numbermarkers.md)

[`src/layers/OverlayContainer.js`]: ../../src/layers/OverlayContainer.js
[`/Layers`]: ../../src/layers/OverlayContainer.js

[`DataLayersPlugin`]: ../06charts/datalayersplugin.md
[`Layers`]: ../02editormap/layer.md
[`map`]: ../02editormap/map.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
