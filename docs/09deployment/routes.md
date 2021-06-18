# Routes

The routes.js file is the way we navigate between the server whose functions, written
in Python, are stored in repository [districtr-eda]. This file was originally concieved
on Fri. Feb 1, 2019 by [@maxhully] and has been maintained by [@mapmeld] since September
of 2019 with help from [@jenni-niels] and [@AtlasCommaJ]. 

## [src/routes.js] 

This file imports `listPLces` from `mockApi` and the `spatial_abilities` list of features
based on location from `utils.js`. This file also has an object known as `routes` that pair strings
like `/new` and `/edit` with themselves to help a route determine if it is in this
list.

### `navigateTo(route)` 

Checks routes to see if it's in the allowed list. This route may even have the `?event` query
string. Ultimately, the function should navigate to the document provided by the route as
determined by `deploy` or throws an error. 

### Local storage and starting a New Plan

New plan are often loaded from the [state portals], which collects the following information
and saves them for use with `savePlanToStorage(...)`. This information, saved in local storage
is loaded within the parameters of `startNewPlan(...)`.

- `place`, state or location
- `problem`
- `units`, precincts or census units
- `id`, arbitrary name-code
- `setParts`, number of districts to be drawn
- `eventCode`, optional code tied to specific events

`savePlanToStorage` simply saves these items in an object assigned to `localStorage.savedState`.

`startNewPlan` takes each of these factors as parameters. First, `problem.numberOfParts` is updated
with a new number from `setParts`. This update is then replaced in local storage. Then, an
action must be determined based on whether this is in local host development and whether
the problem type is `COI` or a `plan.` Standard new districting plans are typically saved
in local storage and the user is navigated to `edit/`, with any event codes passed along. 

To `getContextFromStorage()` is much easier. The current state is fetched from the local
storage and checked for JSON validity. If it doesn't pass, then we are navigated to the
default `/new` plan. 

### Database Storage

Saved plans are stored in a MongoDB database with schema outlined
in the [`lambda`] folder. To save a plan to storage, we use
`savePlanToDB(...)` with the following parameters.

- `state`, the object that stores current assignments
- `eventCode`, an optional code
- `planName`, an optional name
- `callback`, function to be called afterwards. 

Since the `state` is essentially an object that follows the plan/context
format, we serialize this object into a string. In addition, we create
various ids, tokens and a `saveURL` such that a `requestBody` can be contructed
as an object with the following keys.

- `plan`, the serialized string converted back into an object

- `token`, token fetched from local storage, probably containing a date
- `eventCode`, optional event code
- `planName`, optional planName
- `isScratch`, bool tied to checkbox id `#is-scratch` 
- `hostname`, host name in current window

> VA plans may have precinct names with .'s which need to be replaced.

The `requestBody` is now posted to the `saveURL` and a response is then
parsed. An `action` is set, just as with `startNewPlan(...)`, extra query
strings are generated, a new token is set in local storage with the current
Date, a preview image is generated, if permitted by `spatial_abilities`, 
with server function `picture2` and the callback function is triggered. Any
callback errors are caught. 

_history used at all?_

### Flat File Formats

Plans in db storage, typically fetched in `edit.js`, are returned as JSON
files. Thus, `loadPlanFromJSON(planRecord)` is useful for both reading
local json format files and remotely saved plans. 

The returned object is the object result of the json with additional
places included from `listPlaces(...)`. 

There are two ways to load a plan from JSON from argument `planRecord`.
Sometimes, they're flat files and the `planRecord` itself is the plan
we use to load. If `planRecord` was the result of a database call, 
then it carries a both a `plan` and a `msg`. We use `planRecord.plan`
as the relevant plan to load. 

Loading plan from a csv is similar, using function `loadPlanFromCSV(assignmentList, state)`.
The header row is kept in a new format akin to `id-state.place.id-state.units.id`, where
each column header is separated by a dash. The object is to update the parameter
`state` object, with information found in the csv. This function must find a list of places
using `loadPlanFromCSV(...)` and use each row to set precinct-district assignments.

Finally, one can `loadPlanFromURL(url)` which fetches a JSON stored at an address and uses
`loadPlanFromJSON` to complete updating the `state`. 

# #

### Suggestions

- The `routes` object has identical keys and values making it redundant.
What is the advantage of this structure?
- So much occurs when `loadPlanFromJSON(...)` and `loadPlanFromCSV(...)`
returns the response from `listPlaces`, that helper functions could be 
written to help clarity
- In `savePlanToDB`, the `state` argument
is serialized and in the request body,
it is stringified and parsed. I might be
wrong, but this seems to turn an object
into a string and back into an object
again. What is the advantage of this
process?
- The `serialized` variable is used in
different ways. What is the difference
between using `serialized` and the `state`
object directly?
- The `history` variable is not initialized
or used anywhere