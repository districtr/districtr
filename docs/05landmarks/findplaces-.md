# PlacesList

Sometimes, a full or partial list of available places or modules
is required. Located in `src/components/PlacesList.js` are
functions that use `mockapi.js` to help us traverse through
available modules for presentation to the user using class `PLacesList` 

## Listing Places

The common way to collect modules, for landing pages, events and such,
is the function `listPlacesForState(...)` that is called to reutrn an
objects of objects. In essence, this function returns the result of
function `listPlaces(...)` in `mockapi.js`, filters the results whether only communities are required and by US state. 

### `listPlaces(placeID, stateName)`

Within `/src/api/mockApi.js`, a simple function takes two arguments,
`placeID` and `stateName` to traverse the `/assets/data/modules/` folder.
The `stateName` is most vital in this operation as module json files
are organized by this name. In fact, if a `placeID` has no `stateName`,
object `lookupState[placeID]` in `lookupOldState.js` is used to provide
one.

Other than `PlacesList.js`, function `listPlaces(...)` is only ever called
by `routes.js` where it is used to lookup modules by `placeID` that are
loaded by JSON or by CSV. If `placeID` is null, then all places in a state
are returned.

> The function in `mockApi.js` replaces the `listPlaces()` function provided
in `src/api/places.js`. 

_places.js is deprecated._
_rather than API, can we just have a master list of modules like
spatial_abilities?_
_lookupOldState.js may not be updated after new modules are added_

## Class `PlacesList` and function `PlacesListForState(...)`

These were both once used in the more full featured version of
`PlacesMap` but have since been deprecated. 

_placesList deprecated_

## Helper and Communities Functions

The `community.js` view uses the `onlyCommunities()` function to set
what appears to be a global variable `justCommunities` to true. This
variable is used by function `communitiesFilter(place)` to select
places where their `districtingProblems` indicate that it is coi
oriented.

_couldn't this be done by spatial abilities?_

Similar functons that check module feature are `getUnits(...)`.

A pair of functions are responsible for rendering in the document.

This includes, the `problemTypeInfo` const which generates information
for `multimember` and `community` type problems and `getProbleminfo(...)`,
which is deprecated.

Function `placeItems(...)`, once used more heavily in the deprecated
Class `PlaceList`, is used in `event.js` to generate event cards.

_is this the same as the cards used in the state landing pages?_
_getProblemInfo deprecated_
_places.json deprecated_
