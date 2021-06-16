# Other Utilites

Apart from `spatial_abilities`, the `utils.js` file carries a variety of
different utility functions to help consolidate routine tasks.

## Math and Number Format Functions

A set of functions, used widely, related to arithmetic or the kind
display of numbers.

- `zeros(n)` returns an array of zeros, for use in initializing vectors.
- `summarize(data)` returns an object wih data min, max, total and length, but is not used.
- `numberWithCommas(x)` returns a string with comma-styled thousands separator from [here]("From https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript#2901298)
- `roundToDecimal(n, places)` takes a number `n` and rounds it to `places` level of significance
- `sum(values)` sums all `values`
- `divideOrZeroIfNaN(x, y)` divides two numbers and returns zero if division by zero error arises
- `asPercent(value, total)` returns a string that represents the proportion of `value` over `total` as a percent. 

_summarize not used!_

## Functions for Reducers

Reducers takes a current state and a change and produces a new state. The following
functions are used to create and consolidate reducers and the actions that trigger
their change. Specific actions may trigger specific handlers within a reducer.
In districtr, reducers, actions and states are related to UI settings. 

-`createReducer(handlers)` creates a function that, given a `state` and `action`,
triggers `handlers` or returns the original `state`.
- `combineReducers(reducers)` creates a function that combines the reducers such that
any `action` that affects any of the `reducers` produces a new `state`. 
- `createActions(handlers)` derives an array of actions based off the `actionType` of
each element in `handlers`. 
- `bindDispatchToActions(actions, dispatch)` binds actions to an event dispatch, but this
function is not used. 

_bind dispatchToActions not used!_

## HTTP Response Utilities 

- `handleResponse(handlers)` does the following described by the original code
and is used in the following files. 
```
* Handle HTTP responses by providing handlers for HTTP status codes.
*
* The `handlers` object should have handlers for each status code you want
* to handle (e.g. 200, 500) as well as a "default" handler for all other
* cases.
```
  - /src/views/register.js 
  - src/api/places.js
  - src/views/signin.js 
  - districtr/src/views/request.js

- `download(filename, text, isbinary)` is used by `tools-plugin.js` when json, shp or
zip files are downloaded by the user into their browser. 

## Other Utilities for Routine Tasks

-`replace(list, i, item)`, replaces the `i`th object in a `list` with an `item`. 
- `isString(x)`, used only in `Layer.js`, checks to see if x is an instance of String
- `dec2hex(dec)`, sourced from [here](https://stackoverflow.com/questions/1349404/generate-random-string-characters-in-javascript), converts decimal to hexadecimal numbers but is
not used.
- `generateId(len)` creates a random number array of length `len` to create ids for
`CoalitionPivotTable.js`. `Overlay.js` and `State.js`. 


_dec2hex not used_

## Bind All
- Functions attached to specific object instances allow them to be called externally,
akin to `object.function`. This is typically done by the `function.bind(obj)` form.
`bindAll(keys, obj)` applies this to a full array of functions and is used in... 
- src/models/UIStateStore.js 
- districtr/src/components/AboutSection.js 
- src/components/Toolbar/LandmarkTool.js 
- src/plugins/community-plugin.js 
- src/map/CommunityBrush.js
- districtr/src/map/Brush.js 

These files bind more than three functions at a time but do not use `bindAll(...)`
making them good candidates fo using this function. 
- components/Toolbar/Toolbar.js
- src/layers/PartisanOverlayContainer.js 
- districtr/src/models/NumericalColumn.js 
- districtr/src/layers/PartisanOverlay.js 
- /src/layers/Overlay.js
- districtr/src/models/Subgroup.js 
- /src/components/Toolbar/BrushTool.js 
- districtr/src/map/Hover.js 

## Utilities for Mapping and Geodata

- `boundsOfGJ(gj)` used in `edit.js` when loading a plan, finds the boundary
coordinates for a geojson, extracting coordinate information from `getCoordinatesDump(gj` 
- `COUNTIES_TILESET`, used in `counties.js` and `index.js`, provides `sourceLayer` and
`source` mapbox settings for 2018 US County boundaries
- `stateNameToFips`, is an object that pairs lower-cased state names with two digit FIPS
codes. 
- `nested(st)` returns a boolean if `st` is one of AL, IL, IA, MN, MT, OH, OR, SD, WA
or WI, states whose local legislative assembly distircts fits coterminously inside state
senate districts.

# # 

### Suggestions
