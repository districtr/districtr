# The Landmarks Class

The purpose of the `Landmarks` class is to organize map `Layer`s,
`Tooltip`s and helper function `LandmarkInfo` for display on the
mapbox `map` canvas. 

Loaded by the `LandmarkTool` and the `community-plugin`  

Saved in src/components/Landmark.js 

`LandmarkTool` hands in blank `updateLandmarkList`

## export class `Landmarks`

### Construction

Construction of the `Landmarks` class requires arguments `map`, the
mapbox-gl map canvas, `savedPlaces`, a list of places within an area
from `state.place.landmarks` and a function `updateLandmarkList`. 
The two latter parameters are saved as instance methods but `map`
is not. 

_map and this.layer.map is the same!_

Several new objects are also created and kept as instance variables.
- `this.layer`, a `Layer` for polygons
- `this.landmarksTooltip`, a `Tooltip` layer that uses `LandmarkInfo` to
display landmark information upon hover
- `this.points`, a `Layer` for point landmarks
- `this.ptsTooltip`, a `Tooltip` correlary for the points layer
- `this.drawTool`, a `MapboxDraw` layer as control. 

Finally, a pair of listeners are tied together to create and
update a draft layer before adding the new landmark to `this.savedPlaces`. 

### New Layers

There are two new sets of layers created within the `Landmarks` class,
one for Polygons and one for Points. For each set, we must first `addSource`
to a map, either `this.savedPlaces` or `this.points`. Then, a new `Layer`
object must be created, using the source we created in `addSource`, with
properties unique to fill or circle types. Finally, a new `Tooltip` layer
must be drawn for each set, tied to each new `Layer` object and directed
to use `LandmarkInfo` for display.

### Drawing Landmarks

A new control is added to the map, saved as a `this.drawTool` and
added to the map using `map.addControl(...)`. Two new listeners are
then applied to the mapbox-gl `map`, on `draw.create` and `draw.update`.

When we `create` a feature, we create a feature with a dummy `number_id`,
`name` and `short_description`. This dummy point is not rendered anywhere
but added to `this.savedPlaces.data.features` and `this.updateLandmarkList(true)`
is called.

It is on update, when we drag the feature, that it is assigned a location
such that it is rendred. It operates on each `feature` contained within
event `e`, which saves a `geometry` which correspond to map points, and
updates those features within `this.savedPlaces.data.features.`

### Helper Functions

Two functions are used by `LandmarkTool` for use by the `Landmarks` class
to display "ImportantPlaces" or general activation. 

`handleToggle(checked)` deals with the `Landmarks` class' own visibility
and sets its layer opacity and activates and deactivates the tooltip.

`handleDrawToggle(checked)` is responsible for adding or removing 
the `this.drawTool` from the mapboxgl-map. 

## LandmarkInfo

`LandmarkInfo` provides html for tooltip display upon landmarks when needed. 

Features that have any short descriptions are denoted as `simpleFeature`s or not
and are displayed with more or less detail in div class `tooltip__text`. 

### Other Color Properties

`landmarkPaintProperty` and `landmarkCircleProperty` are objects that
specifiy opacity, color, with hover cases, and radius size for landmarks.

# #

### Suggestions
- Do we draw Polygon landmarks anymore? Mapbox Drawtool comments out all controls
but for points. Maybe this is vestigial. 
- Should the listeners in the constructor be deanonymized and turned into helper
functions?
- Properties across the whole system should be collected together elsewhere so that
configuration is easy. Can we at least save these properties at top of file with
AllCaps names?
