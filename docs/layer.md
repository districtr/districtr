
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

