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

### Adding Layers
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
- `borderId`, coressponding to the context `place.id`.

Each tileset is added as a map's Source and relies on the following
helper functions. 
    - `addUnits` which adds a pair of layers for paintable districts,
    `units` and `unitsBorders`
    - `addPoints`, a layer of circles correspodning perhaps to
    landmarks.
    - `addCounties` sourced from `COUNTIES_TILESET` stored in our
    library.

Maps that deal with communities of interest additionally use
`addPrecincts` (currently only in use with North Carolina) and
`addTracts`. If city borders are used in a coi map, this city's
boundaries will be rendered thick. 

Finally, swipe maps, described below, have their own unit and border functions. 

### Other Features
- In June of 2020, a pilot of swipe functionality was committed to
pertain only to Georgia. This introduces a `MapSliderControl` class is
included as part of this experiment.

https://github.com/districtr/districtr/pull/68