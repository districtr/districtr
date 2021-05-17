# Contexts and States
_Commentary by [@gomotopia][1], May 2021_

The current state of a plan is kept in data objects akin to those
prescribed the districtr-json. These contexts are read into the edit.js
and stored as a `State` object which interacts with the `Toolbar` and
`Map`.

## src/models/State.js
The State object is kept as a model in its own `State.js` file. This
dates from about Nov 2018, written by @maxhully[]. Maintained by
@mapmeld[] since September of 2019. 

### Imports
Important imports include...
- `addLayers` from Map.js[]
- The `IdColumn` class
- Utilities like `assignUnitsAsTheyLoad` from `./lib/assign`,
`generateID` from `utils`
- Column utilties from `./lib/column-set`
- Layer functions from `map/Layer`.

### The `State` Class
The `State` class formally retains context information read into
districtr and keeps track of changes made by the toolset, like brushing.
It is called in `edit.js`[] when `loadContext` is ready to complete and
is collected by the `Editor`[] object with a corresponding `MapState`[].

It's construction relies on the `MapState.map` Mapbox object, ready for
use within the HTML DOM, an experimental `MapState.mapswipe` that is
rarely used, an important context JSON object and a readyCallback,
currently set in `edit.js` to rename the window title.

The important [context JSON object][] is described here and contains
information about the current plan's `place`, `problem`, `id`,
`assignment`, `units` and more. Each of these pieces are kept in
instance variables like `this.unitsRecord` and `this.place`.

Meanwhile, an `IdColumn` is created based on the parameter context 
`units` and the `State`'s instance `this.plan` is created by providing
a new object of type `DistrictingPlan`. 

A complete list of instance variables are as follows. 
- `this.unitsRecord`
- `this.place`
- `this.idColumn`
- `this.plan` as `DistrictingPlan` and updates district assignments.
- `this.columnSets`
- `this.subscribers`
- `this.update`, bound to the `update` instance method
- `this.render`, bound to the `render` instance method

Instance method `this.initializeMapState` acts to intialize a new Layer
for the `Map` object using `addLayers`[], which requests parameters
`map`, `swipemap`, `unitsRecord`, `layerAdder` and `borderId`. This function returns the following values that are then assigned as instance methods
for the `State` instance.
- `this.units`, the same as unitsRecord?
- `this.unitsBorders`
- `this.sweipeUnits`, experimental
- `this.counties`
- `this.layers`, which looks for `units`, `points`, `bg_areas`, 
`precincts`, `new_precincts` and `tracts` layers
- `this.swipeLayers`, experimental
- `this.map`, the map itself, as DOM object.

State keeps the following instance methods apart from its `constructor`
and the `initializeMapState` functions.
- `activeParts()` returns parts that are set to visible.
- `parts()`, returns all parts in the plan. 
- `problem()`, specific speficiation on offices and district numbers
- `serailize()`, returns a json format string of the current map state
- `subscribe(f)`, subscribes external subsribers to be rendered with
state
- `render()`, for lit-html, renders each subscriber into template
- `hasExpectedData(feature)`, experimental feature.


## The DistrictingPlan class
The `DistrictingPlan` is the first in a set first suggested by
@mapmeld[] in future refactoring.
```
// We should break this up. Maybe like this:
// [ ] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?) ? <--- really need this one
// "place" is mostly split up into these categories now.
```

A `DistrictingPlan` requires or generates an `id`, a `state`, a
`problem`, an `assignment`, a `place`, a number of `parts` with caveats
for mutlimember of community type problems and saves them as instance
variables.

Methods include... )
- `update(feature, part)` assigns a single feature to a district part
- `serialize` which returns a a portion of the districtr JSON object