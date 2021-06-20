# Notes









## 04

### Brush

- Functions `colorfeatures(...)` works in service to the heftier function
`_colorfeatures(...)`. Could we just rename these two such that the
first function, which selects the appropriate filter, is a helper
instead of a gateway?

- The sprawling function `_colorFeatures(...)` investigates both
individual units and whole counties. Could we separate these two into
separate functions?

- Every time `this.changedColors` is cleared, it is pointed to a 
`new Set()` javascript object, which starts out empty. This creates
many `Set` objects with each you. Though the memory savings on reusing
the same object are miniscule, wouldn't it be clearer to use function 
`clear(...)` on the original object?

### Hover

- Within districtr units generally refer to the base precincts or census areas that we use
to build districts. However, within the code base, `units` sometimes refers to these areas
in the plan/context and sometimes to the mapbox `layer`. Maybe using `units` and `unitsLayer`
consistently would be less confusing.
- What is a State? A dizzying notion. Is it...
  - The State political unit?
  - The UIState `state` object?
  - The FeatureState, as in the condition properties of a feature?  

## 05

### Landmarks Class

- Do we draw Polygon landmarks anymore? Mapbox Drawtool comments out all controls
but for points. Maybe this is vestigial. 
- Should the listeners in the constructor be deanonymized and turned into helper
functions?
- Properties across the whole system should be collected together elsewhere so that
configuration is easy. Can we at least save these properties at top of file with
AllCaps names?

### Landmark Tool

Deprecated

### myCOI

Deprecated

### Find Places

Currently, the role of `findPlaces.js` is to find
and match modules. This requires traversing the
entire folder of modules. This takes a lot of effort
but is done only once, so we live it. 

Object `spatial_abilities` is the next closest thing
to a master list of modules. Instead of using an 
API, could we extend `spatial_abilities` such that it is a master list of modules?

For instance, we expend effort trying to extract modules related to
communities and localities, though in other parts of the code, this is
handled by `spatial_exceptions`.

We see the benefits of this when considering the
function `lookupState` from `lookupOldState.js`, used
by `listPlaces.js`, where modules are matched up to the 
state they belong to, but this function is not updated 
when new modules are added. 

In addition...

- Originally, in folder `/src/api`, `places.js` was
used to traverse modules. That has since been
replaced by `mockApi.js`. 
- Class `PlacesList`, with its html rendering, was
once used in a more full featured version of 
`PlacesMap` which has since been deprecated.
- Function `placeItems(...)` was once used in `PlacesList` but is now
only used when view `event.js` produces cards for plans. Could this be
similar to the cards already generated in landing pages elsewhere?
- `getProblemInfo(...)` also doesn't appear to be used anymore

### COI

### Suggestions

- The `PopBalancePlugin` and the `EvaluationPlugin` both have conditions on `community`
but is not part of the plugins created in Community mode
- Within State Portals, `onlyCommunityMode` used to exist for places where we didn't have
state-wide maps. This is now vestigial. 
- While it's good to have `CommuntityBrush` extends `Brush`, `Brush` still has a few
conditions that rest upon `community`, which are now never called.
- Most ways COI mode is conditioned upon is for simple labels. Maybe we could create a
simple labels object and condition only once. 
- When one pushes the Important Places "Create" button, its mode cannot be cancelled until
a new landmark is added, which can be deleted right after. 
- `coi2` is a form of Community of Interest mode that is used very rarely and may not
be needed. 
-`PlacesList.js` and `PlaceMap.js` are vesitigial

## 06

### Data Layers Plugin
- Since `edit.js` lists plugins to load by `problem.type`, it is redundant to
have so many use cases depend on the difference between `districting` and `community`
modes. With the proper management of helper functions, it's probably easier to just
write two separate data plugins for districting and coi modes.
- This sprawling functions has become so because of the many, many hard coded cases
and exceptions for loading a variety of similar layers. Surely, one can imagine
consolidating loadable layers in a director, say `spatial-abilities` itself, and
creating a `makeGenericLayer` class to read in sources, labels, and so on. This could
cut the amount of code by half. 
- A result of having so many use cases is that the places where json source data loads
and where it is added as a layer and toggle button is separated. This makes it hard to
see that, say, the ids `lax`'s current 2013 districts' source in the map is titled,
with `va` instead of `lax.`
- When rendering the rent overlay legend bars, the notches are rendered inside a 
div class '.vap' and not say `,rent`.
- When loading early city example Lowell, MA, is loaded a hard coded coalition is written
as default. Maybe this can be removed or moved to `spatial_abilities.` 
- `vapEquivalents` is a reference table that converts standard census population codes
into vap codes. Could this constant be kept above or folded into
`../components/Charts/CoalitionPivotTable`?

### Data Set Info
- Is there a way we can handle these special cases and special language in `spatial_abiliies`?
- Directives come from AngularJS, whereas we use lit-html throughout Districtr for templating.
Can't we just use lit-html to populate this text?

### Demographics Table
- `DemographicsTable` imported by `data-layers-plugin` but is not called. 
- Many table types reimplement `getBackgroundColor` and `getCellStyle` identically.
This, along with the `popNumber` formatter can be collected in its own utils file. 
- When used by `DemographicsTable` and its "descendents", argument `decimals` can hold three values, `true`, `false` and `"population"`. Since `decimals` is no longer a strict
boolean, `true` and `false` should be renamed. 
- Condition `part !=== null` is redundant, as a null `part` is equivalent to `false`.
While `null` and `undefined` are equivalent, they are used as conditions in their own
right elsewhere in the code. 
- `mockColumnSet` can be written as its own helper function in `evaluation-plugin.js`. 
- `RacialBalanceTable` hard codes a special case for 2018 and 2019 data.
- In `SelectBoxes`, "Comapare" and "with" are contained in an Array, but "and" is a
special case. Should they be in one array?
- `AgeHistogramTable`, makes space all possibly districts in the editor, even if there's
many dozens and it takes up space. This is pronounced when Histograms are used.   
_ `AgeHistogramTable` does not create an overall area age breakdown like `RacialBalanceTable`. This may require more involved programming.

### Evaluation Plugin
- Two equivalent if statements `state.elections.length > 0` should be
combined.
- Initial `isOpen` states can be delegated to a helper function.
- One can simplify the contiguity if statement as this plugin is never 
called if `problem.type` is "community"
- Separate out VRAtab as new plugin. 

### Pop Balance Plugin 
- So much is similar with single and multimember districts, we could use in-line if statements_
- Both Population Deviation and Unassigned Population are short and can be combined in the pop-balance-plugin file_
- ZoomToUnassigned should be moved to Unassigned.js 

### Population

Both `indiciesOfMajorSubgroups()` and `RacialBalanceTable` filter out 2018 and 2019
data. Could this be consolidated?

### ColumnSet Parts
- Constant `ABBREVIATIONS` is kept by the `Subgroup` class, but abbreviations
and other utilities should be kept together in a utils file. 
- Class `SumOfColumns` is so similar to `NumericalColumn` and `Subgroup` that it
could extend or be rolled into one of these classes
- It's natural for `column-sets.js` to list all possible columns, but since each
possible columnset is hard coded, lots of work is necesssary if we were to add a
new data type. This is alluded to in the original documentation.
- In function `getColumnSets(...)`, if statements check each type of columnset,
like `if (state.vap)` twice. Could this condition be folded into itself so that
it is called once?
   - Actually, within this function, what's the difference between `state.columns` and
the `columnsets` array? 
- Philosophically, I think `State` should be responsible for the addition of its
own columnsets with a function like `addColumnSet(...)`. I also think that state should
initialize blank versions of any of its instance variables at the onset for clarity's
sake.

- Why is `src/models/lib` its own folder

### DataTable

The `PivotTable` and the `CoalitionPivotTable` are both very similar
implementations of `DataTable`. Is there a way that `CoalitionPivotTable`
could inherit from `PivotTable` or extend `PivotTable` to include
coalition properties?

- `CoalitionPivotTable` is called in `CommunityPlugin` and
`EvaluationPlugin` but is not used. It is created only once in
`DataLayersPlugin`
- Thus, `totals_only` in `CoalitionPivotTable` is only set to true, 
making `CoalitionPivotTable` even more similar to `PivotTable`

### ElectionResults

In `PartisanOverlayContainer`, a checkbox element is hard coded. Could
we use the `Toggle` object instead?

### Highlight Unassigned

- The `PopBalancePlugin` creates a function, `zoomToUnassigned` that is
always used with `HighlightUnassigned`. Thus, it makes more sense to have
that function written in that file. 

- `zoomToUnassigned` is the only function outside of `routes.js` that
talks to the PythonAnywhere. For clarity sake, this call should be
collected in one file. 

- Finally, that function makes references to the mapbox-gl map, which
can alternatively be called from `edtior.state.map`, `editor.mapState.map`
and is probably even `editor.map`. For clarity, there should be one way
to reach this map, which suggests that global variables might be useful.

### Histogram

There are only two kinds of Histograms, one for age and one for income.
They are used in separate plugins through two complete separate functions.
Thus, for clarity sake, logic around `isAge` could be abstracted to
the separate functions alone, leaving Histogram a more generic object.

There are eight places where `isAge` is tested in Histogram. 

- The `AgeHistogram` is called but not used in muti-layers-plugin

- The `widthMultiplier` is practically redundant as it modifies hard
coded values for income and age histograms. It is always 1.5 and 1
respectively and modifies widths 44 and 2 respectively. Thus these
values could be hard coded 66 and 2 without `widthMultiplier`.

### Suggestions

- A reminder that `state.population` is not initialized in the initial creation
of the `state` object.
- Another reminder that svg can be modified by css, if global formatting is needed.
- Consts, hard-coded display settings, are defined as global variables, which could
live in utils as an object.


## 07

### State Portals

- So many anonymous functions are used to render `html`. Perhaps a few longer ones can
be separated out as helper functions
- Functions `drawTitles(...)` and `getProblems(place)` are no longer used anywhere
- Since every state has a statewide plan, `onlyCommunityMode` is no longer needed
- The population of districting and community cards occurs later than when it
is given structure in the HTML. Maybe they should be placed closer together for
clarity.

### Index

It is vestigial to have a sign in header or `initializeAuthContext`, which makes
`clearQueriesFromURL()` less important.

### Place Map

So much is deprecated from the days when local communities were either displayed, then listed, then 
sent straight to state landing page. 

## 08

### Event

An object model should be made for each event that stores specific links and materials rather than hard coding
different fields for many events.

## 09

### Mongo Lambdas
`db` from `server.js` is imported but not used in the following files.
Perhaps it is important in creating a connection, so no explicit use indeed, it is never used in any case it is imported.
is necessary. 
- `eventRead.js`
- `planCreate.js`
- `planPreview.js`
- `planRead.js`
- `planText.js`
- `planUpdate.js`

### Package
Wrangling packages for npm is its own specialty. While reviewing the code,
it appears that `caniuse-lite?` and `encoding` don't appear to be used
but may serve some other function, like as prerequisites. 



###

### Routes
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


## 10

### Spatial Abilities
- This special object should be made into its own file to highlight
its importance.
- A comprehensive listing of available features could also live in that new
file.

### Utils
- Functions `summarize(...)`, `dispatchToActions(...)` and `dec2hex(...)`
are defined but not used anywhere

### Place Exceptions
Much of districtr's features and displays are dependent on the `place`
of the current module. As such...
- extra layers like "School Districts" can be stored as an object
- and map style, like `streets-v11`
... can be stored in `spatial_utilties`

Finally, `altcounties`, where Louisiana Parishes and Alaska Boroughs
serve as Counties, should be set by State rather than `place` because
`place` could refer to alternative datasets or local municipalities.
