# Other Utilites

Apart from [`spatial_abilities`], the `utils.js` file carries a variety
of different utility functions to help consolidate routine tasks.

## Math and Number Format Functions

A set of functions, used widely, related to arithmetic or the kind
display of numbers.

- `zeros(n)` returns an array of zeros, for use in initializing vectors.
- `summarize(data)` returns an object wih data min, max, total and
length, but is not used.
- `numberWithCommas(x)` returns a string with comma-styled thousands
separator from [here].
- `roundToDecimal(n, places)` takes a number `n` and rounds it to
`places` level of significance
- `sum(values)` sums all `values`
- `divideOrZeroIfNaN(x, y)` divides two numbers and returns zero if
division by zero error arises
- `asPercent(value, total)` returns a string that represents the
proportion of `value` over `total` as a percent. 

## Functions for Reducers

[Reducers] takes a current state and a change and produces a new state.
The following functions are used to create and consolidate reducers and
the actions that trigger their change. Specific actions may trigger
specific handlers within a reducer. In districtr, reducers, actions and
states are related to UI settings. 

- `createReducer(handlers)` creates a function that, given a `state` and
`action`, triggers `handlers` or returns the original `state`.
- `combineReducers(reducers)` creates a function that combines the
reducers such that any `action` that affects any of the `reducers`
produces a new `state`. 
- `createActions(handlers)` derives an array of actions based off the
`actionType` of each element in `handlers`. 
- `bindDispatchToActions(actions, dispatch)` binds actions to an event
dispatch, but this function is not used. 

## HTTP Response Utilities 

`handleResponse(handlers)` does the following described by the
original code and is used in the following files. 
```
* Handle HTTP responses by providing handlers for HTTP status codes.
*
* The `handlers` object should have handlers for each status code you want
* to handle (e.g. 200, 500) as well as a "default" handler for all other
* cases.
```
  - src/views/register.js 
  - src/api/places.js
  - src/views/signin.js 
  - districtr/src/views/request.js

- `download(filename, text, isbinary)` is used by [`tools-plugin.js`]
when json, shp or zip files are downloaded by the user into their
browser. 

## Other Utilities for Routine Tasks

- `replace(list, i, item)`, replaces the `i`th object in a `list` with an
`item`. 
- `isString(x)`, used only in `Layer.js`, checks to see if x is an
instance of String
- `dec2hex(dec)`, converts decimal to hexadecimal numbers but is not
used.
- `generateId(len)`, sourced from [this site] creates a random number
array of length `len` to create ids for [`CoalitionPivotTable.js`].
[`Overlay.js`] and [`State.js`]. 

## Bind All
- Functions attached to specific object instances allow them to be
called externally, akin to `object.function`. This is typically done by
the `function.bind(obj)` form. `bindAll(keys, obj)` applies this to a
full array of functions and is used in... 
- [`src/models/UIStateStore.js`]
- [`src/components/AboutSection.js`]
- [`src/components/Toolbar/LandmarkTool.js`] 
- [`src/plugins/community-plugin.js`] 
- [`src/map/CommunityBrush.js`]
- [`src/map/Brush.js`] 

These files bind more than three functions at a time but do not use
`bindAll(...)` making them good candidates fo using this function. 
- [`components/Toolbar/Toolbar.js`]
- [`src/layers/PartisanOverlayContainer.js`]
- [`districtr/src/models/NumericalColumn.js`]
- [`districtr/src/layers/PartisanOverlay.js`] 
- [`src/layers/Overlay.js`]
- [`src/models/Subgroup.js` ]
- [`src/components/Toolbar/BrushTool.js`]
- [`districtr/src/map/Hover.js`]

## Utilities for Mapping and Geodata

- `boundsOfGJ(gj)`, used in `edit.js` when loading a plan, finds the
boundary coordinates for a geojson, extracting coordinate information
from `getCoordinatesDump(gj` 
- `COUNTIES_TILESET`, used in `counties.js` and `index.js`, provides
`sourceLayer` and `source` mapbox settings for 2018 US County boundaries
- `stateNameToFips`, is an object that pairs lower-cased state names
with two digit FIPS codes. 
- `nested(st)` returns a boolean if `st` is one of AL, IL, IA, MN, MT,
OH, OR, SD, WA or WI, states whose local legislative assembly distircts
fits coterminously inside state senate districts.

# # 

### Suggestions
- Functions `summarize(...)`, `dispatchToActions(...)` and `dec2hex(...)`
are defined but not used anywhere.

# #

[Return to Main](../README.md)
- [Spatial Abilites](./10spatialabilities/spatialabilities.md)
- Previous: [Inventory of Place Based Exceptions](./10spatialabilities/placeexceptions.md)

[Reducers]: ../03toolsplugins/actionsreducers.md


[`State.js`]: ../01contextplan/state.md

[`Overlay.js`]: ../02editormap/layeroverlay.md
[`src/layers/PartisanOverlayContainer.js`]: ../02editormap/layeroverlay.md
[`src/layers/Overlay.js`]: ../02editormap/layeroverlay.md
[`Overlay.js`]: ../02editormap/layeroverlay.md

[`tools-plugin.js`]: ../03toolsplugins/toolsplugin.md
[`src/models/UIStateStore.js`]: ../03toolsplugins/uistatestore.md
[`components/Toolbar/Toolbar.js`]: ../03toolsplugins/toolbar.md
[`src/components/Toolbar/BrushTool.js`]: ../03toolsplugins/brusherasetools.md

[`src/map/CommunityBrush.js`]: ../04drawing/brush.md
[`src/map/Brush.js`]: ../04drawing/brush.md
[`districtr/src/map/Hover.js`]: ../04drawing/hover.md

[`src/components/Toolbar/LandmarkTool.js`]: ../05landmarks/landmarktool.md
[`src/plugins/community-plugin.js`]: ../05landmarks/communityplugin.md

[`CoalitionPivotTable.js`]: ../06charts/datatable.md
[`districtr/src/models/NumericalColumn.js`]: ../06charts/datatable.md
[`districtr/src/layers/PartisanOverlay.js`]: ../06charts/electionresults.md
[`src/models/Subgroup.js` ]: ../06charts/columnsetsparts.md
[`CoalitionPivotTable.js`]: ../06charts/datatable.md

[`src/components/AboutSection.js`]: ../07pages/index.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

[here]: https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298
[this site]: https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA