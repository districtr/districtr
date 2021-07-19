# The Landmarks Class

The purpose of the `Landmarks` class is to organize map [`Layer`]s,
[`Tooltip`]s and helper function `LandmarkInfo` for display on the
mapbox [`map`] canvas. It is loaded by the [`LandmarkTool`] and the
[`community-plugin`] and saved in [src/components/Landmark.js]. It was
written early on by [@maxhully] in Nov. of 2018 and improved throughout
2020 by [@mapmeld]. 

> `LandmarkTool` hands in a blank `updateLandmarkList` function as an
argument. 

## export class `Landmarks`

### Construction

Construction of the `Landmarks` class requires arguments `map`, the
mapbox-gl map canvas, `savedPlaces`, a list of places within an area
from `state.place.landmarks` and a function `updateLandmarkList`. 
The two latter parameters are saved as instance methods but `map`
is not. 

Several new objects are also created and kept as instance variables.
- `this.layer`, a [`Layer`] for polygons
- `this.landmarksTooltip`, a [`Tooltip`] layer that uses `LandmarkInfo`
to display landmark information upon hover
- `this.points`, a `Layer` for point landmarks
- `this.ptsTooltip`, a `Tooltip` correlary for the points layer
- `this.drawTool`, a `MapboxDraw` layer as control. 

Finally, a pair of listeners are tied together to create and
update a draft layer before adding the new landmark to
`this.savedPlaces`. 

### New Layers

There are two new sets of layers created within the `Landmarks` class,
one for Polygons and one for Points. For each set, we must first
`addSource` to a map, either `this.savedPlaces` or `this.points`. Then,
a new `Layer` object must be created, using the source we created in
`addSource`, with properties unique to fill or circle types. Finally, a
new `Tooltip` layer must be drawn for each set, tied to each new `Layer`
object and directed to use `LandmarkInfo` for display.

### Drawing Landmarks

A new control is added to the map, saved as a `this.drawTool` and
added to the map using `map.addControl(...)`. Two new listeners are
then applied to the mapbox-gl `map`, on `draw.create` and `draw.update`.

When we `create` a feature, we create a feature with a dummy
`number_id`, `name` and `short_description`. This dummy point is not
rendered anywhere but added to `this.savedPlaces.data.features` and
`this.updateLandmarkList(true)` is called.

It is on update, when we drag the feature, that it is assigned a
location such that it is rendred. It operates on each `feature`
contained within event `e`, which saves a `geometry` which correspond to
map points, and updates those features within
`this.savedPlaces.data.features.`

### Helper Functions

Two functions are used by [`LandmarkTool`] for use by the `Landmarks`
class to display "ImportantPlaces" or general activation. 

`handleToggle(checked)` deals with the `Landmarks` class' own visibility
and sets its layer opacity and activates and deactivates the tooltip.

`handleDrawToggle(checked)` is responsible for adding or removing 
the `this.drawTool` from the mapboxgl-map. 

## LandmarkInfo

`LandmarkInfo` provides html for tooltip display upon landmarks when
needed. 

Features that have any short descriptions are denoted as
`simpleFeature`s or not and are displayed with more or less detail in
div class `tooltip__text`. 

### Other Color Properties

`landmarkPaintProperty` and `landmarkCircleProperty` are objects that
specifiy opacity, color, with hover cases, and radius size for
landmarks.

# #

### Suggestions
- Should the listeners in the constructor be deanonymized and turned
into helper functions?
- Properties across the whole system should be collected together
elsewhere so that configuration is easy. Can we at least save these
properties at top of file with AllCaps names?

# #

[Return to Main](../README.md)
- Previous: [Communities of Interests in Use](../05landmarks/coi.md)
- Next: [The Community Plugin](../05landmarks/communityplugin.md)
- [The Old Landmark Tool](../05landmarks/landmarktool.md)
- [My COI](../05landmarks/mycoi.md)
- [Finding Places](../05landmarks/findplaces.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[`Layer`]: ../02editormap/layer.md
[`map`]: ../02editormap/map.md

[`Tooltip`]: ../04drawing/tooltip.md

[`LandmarkTool`]: ../05landmarks/landmarktool.md
[`community-plugin`]: ../05landmarks/communityplugin.md
[`LandmarkTool`]: ../05landmarks/landmarktool.md

[src/components/Landmark.js]: ../../src/components/Landmark.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA