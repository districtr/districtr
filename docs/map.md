# The Map
_Commentary by [@gomotopia][1], May 2021_


Districtr's main editing screen contains both a Toolbar and a Map. In
the HTML, the Map is contained within nested divs 
`#comparison-container` of class `.mapcontainer` and `#swipemap` of
class `.map` created when the Editor[] calls function `loadContext()`.
A `MapState` object is created upon the genesis of an `Editor`[] model
object, updated as a context is loaded and rendered as part of the
`Editor` view[] after a `State` object is created.

## src/map/index.js
The Map object is kept in the javascript map index file. Dates from
about Oct 2018 as src/map.js on @maxhully[]'s original districtr[] repo.
Moved into map folder in Nov. '18 and merged into current districtr repo
on August 17, 2019 in pull #68[].

Maintained by @mapmeld[] since October of 2019 with contributions by
@AtlasCommaJ[]. 

### Imports
Important imports include...
- `mapboxgl` and `MapboxCompare` provided to us from mapbox
- `colors` paint properties
- the `Layer` object
- other `utils`

### The `MapState` class 
The `MapState` class is based on the `Map` provided by Mapbox and its
`mapboxgl`. We define `this.mapboxgl`as a mapbox-type map with options
such as...
- `container`, its home in the HTML DOM
- `mapStyle`, a settings parameter provided on construction
- Map defualts for `center` and `zoom`
- GUI and display options like `attributionControl`, `pitchWtihRotate`,
`dragRotate`, `preserveDrawingBuffer`, `dragPan`, `touchZoomRotate`
- more options as needed, passsed in as a parameter on contruction.

In addition, this object contains `this.nav` to serve as Navigation
Control, as provided by `mapboxgl`. 

### The `addUnits` function

After the default `Map` class is defined, helper method `addUnits` is defined,
which takes in the following parameters...
-`map`, `Map` object to be acted upon
-`parts`, object containing directory of plan parts, for use when determining color
properties.
-`tileset`, a Mapbox tileset object stored in the cloud
-`layerAdder`, a utility function that describes the front-back order of added layers.

This function returns a collection of four `Layer` objects as follows. _Maybe these could be renamed for clarity, e.g., `return (units_layer...` instead of `return (units...`_

- `units`, a layer of standard, paintable precinct/census units, set to specifications from `colors`
- `unitsborders`, a layer of borders around these units, set to specifications from `colors`

The following are currently disabled by `if (false)`

- `coiunits`, a layer created if the original tileset has `precincts` or `counties` to ensure the use
of census block groups.
- `coiunits2`, either null, or a layer of invisible units if the source layer doesn't contain
block groups.

See below for a description of the `Layer` object.

### Additional helper functions

- `addPoints(map, tileset, layerAdder)`, a `Layer` of circles correspodning perhaps to
landmarks, whose default opacity is 0. 
- `addPrecincts(map, tileset, layerAdder)`, a `Layer` of new state voting precincts,
whose default opacity is 0. 
- `addCounties(map, tileset, layerAdder)`, a `Layer` of extra census based tracts, whose
default opacity is 0. 
- `addCounties(map, tileset, layerAdder)`, a `Layer` of state counties, that have the
ability to be hoverable in the map editor. We source these 
- `addBGs(map, tileset, layerAdder)`, a `Layer` of state counties, that have the
ability to be hoverable in the map editor. We source these 

### Adding Layers with `addLayers`
Since settings of which layers to display in the Map are `State`
specific, it is this object which initizalizes the map's layers. Thus,
Map function `addlayers(...)` is of vital important. This function
includes the following parameters:
- `map`, a `MapState` object defined in `edit.js` passed to State and on
to this function. 
- `swipemap`, a boolean related to experimental swipe feature.
- `parts`, a prescribed number of districts
- `tilesets`, the mapbox db source for the unit shapes
- `layerAdder`, different `Layer` display functions depending on whether
the problem is district or community of interest-related
- `borderId`, corresponding to the context `place.id`. _Should we rename this for clarity?_

Each tileset is added as a the Map's mapbox-gl map object's Source and logic is
applied that triggers the helper functions above.

- In one case, when `borderId` exsts and that pecific place/area is permitted by 
`spatial_abilities` to `load_coi`, and if there are exactly two tilesets and neither
of them are blockgroups, we add to the map the original source layers ensured to be
`"blockgroups"` rather than `"precincts"` or `"counties"`... _In a similar operation
to addUnits._ 
- `addUnits(...)` and `addPoints(...)` are always invoked. 
- If the `borderId` indiciates a local Arizona place, `addBGs(...)` is invoked 
- If `spatial_abilities` permits `coi2` for a certain `borderId`/place, and the tilesets
include`coi2`, `precincts`, `new_precincts` are loaded with `addPrecincts(...)` and tracts
are added with `addTracts`. (`coi2` is currently only in use with North Carolina.)
- `counties` are always added using the `COUNTIES_TILESET` found in `utils`. 
- If `spatial_abilities` imply that a certain `borderId`/place indicates that a border
is appropriate, i.e. that city boundaries are found, we display them with a thick
border. These city lines are added as sources, and new Layers are created.

All of these Layers, except for city boundaries, are returned by the `addLayers(...)` function.

Maps that deal with communities of interest additionally use
`addPrecincts`  and
`addTracts`. If city borders are used in a coi map, this city's
boundaries will be rendered thick. 

Finally, swipe maps, described below, have their own unit and border functions. 

# The `Layer` Object
The layer class is one day younger than the Map class, having been first written by
[@maxhully] as `src/Layer.js` on Tues., Oct. 23, 2018. By Halloween, it was moved to
`src/Layers/Layer.js` and moved into the `/src/map/` folder in anticiption of the
big [pull #68] that merged [@maxhully]'s work into [@districtr]'s repository. It has
been maintained by [@mapmeld] since December of 2019.

## Use

If you've been paying attention, the `map/index.js` script has up to 11 ways to make
new layers.

- `addUnits(...)` makes up to four.
    - `units`
    - `units-borders`
    - `coiunits`, currently disabled
    - `coiunits2`, disabled as above. 
- From function `addPoints(...)`
- From function`addPrecincts(...)`
- From function `addCounties(...)`
- From function `bgs(...)`
- And when city borders are invoked...
    - `city_border`
    - `city_border_poly` for city holes.

Elsewhere, new Layers are created...
- In `src/plugins/data-layers-plugin.js` and `multi-layers-plugin.js`
    - For many. many excpetional local municipal boundaries 
- In `src/components/Landmark.js`as an instance variable of `Landmarks`
- In `src/map/NumberMarkers.js`, which adds number markers to the map. 
- In various ways in the `districtr/src/layers/` folder
    - `Overlay.js`
    - `OverlayContainer.js`
    - `PartisanOverlayContainer.js`
    - `amin_control.js`
    - `colleges_hospitals.js`
    - `counties.js` _similar to map/index.js?_
    - `current_districts.js`

_Surely, there's a way to categorize and standardize the creation of layers in a
predictable way._

## Back to `src/map/Layer.js`

The `Layer.js` file still retains some of [@maxhully]'s original documentation. 

### The `Layer` Class

The `Layer` class is always constructed with three parameters. The `map` function, a
`mapboxgl.Map` that renders to the viewer, a `Layer` object that conforms to the Mapbox
style specification, and a helper `adder` function, both described below. Upon construction,
it is added to the map, with or without the specification of an `adder` function, and 
the `getFeature()` is bound to the instance. 

Instances of this class are then given getter and setter methods...
- Paint property functions...
    - `SetOpacity(opacity)`
    - `setColor(color)`
    - `getColor()`
    - `getPaintProperties(properites)` 
    - `setPaintProperty(name, value)`
    - `getPaintProperty(name)`
- Feature functions passed in from the mapboxgl `map` object
    - `setFeatureState(featureId, state`
    - `getFeatureState(featureId)`
    - `getFeature(featureId)`
    - `queryRenderedFeatures()`
    - `querySourceFeatures()`
    - `getAssignment(featureId)`
    - `setAssignment(feature, part)`
- `on(type,...args)` and `off(type,...args)` for mapboxgl
- `untilSourceLoaded(callback)`
- finally, a `handler` function

### Using the Layer functions

### Mapbox Layer Style Spec 

A styled layer object is a simple object with...
- an `id`
- its `source`
- its `type` be it `"line"`, `"point"`, `"polygon"`, etc.
- A `paint` sub-object with `line-color`, `line-opacity` and `line-width`

_This parameter is often titled `layer`, making it easy to confuse with the 
`Layer` model used throughout._

### Adder functions

Adder functions are designed to order layers properly. As [@maxhully] wrote, 
"The addBelowLabels method gives the right look on the Mapbox "streets" basemap, while addBelowSymbols gives the right look on the "light" basemap." Each function is automatically
given the mapboxgl `map` and `layer` style spec when it is added.

* * *
 
### Other Features and Exceptions
- In June of 2020, a pilot of swipe functionality was committed to
pertain only to Georgia. 
- `coi2` is only in use with North Carolina and local Arizona places are
granted special dispensation. 

https://github.com/districtr/districtr/pull/68
