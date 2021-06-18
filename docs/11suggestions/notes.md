# Notes

## 01

state.md

### Observations and Suggestions

On Mon., Apr. 22, 2019, [@maxhully] suggested that this State class be
broken up, as mentioned above.

```
// We should break this up. Maybe like this:
// [ ] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?) ? <--- really need this
one
// "place" is mostly split up into these categories now.
```

Finally, `State.initializeMapState(...)` calls and returns from only one
function. Is it needed?

## 02

### Layer

- Given the nearly two dozen ways layers are created, there's surely a
way to categorize and standardize the creation of layers with a more
predictable form.
- `Layer` objects and a `layer` specification object are titled in such
a way that it is easy to confuse

### Map
- `this.mapboxgl` instance variable not used
- "Units" is used in many ways. Perhaps the units layer could be renamed
for clarity, e.g., `return(units_layer...` instead of
`return (units...`
-`borderId` could be renamed given that it corresponds to `place.id`. 

### Number Markers

- `brush` is a parameter passed into the `NumberMarkers` function but
isn't used. 
- Having `window.planNumbers` in `tools-plugin.js` reveals to us a
method by which we can assign global variables. It may be useful to do
this with more objects, like `State`, `Toolbar`, etc. A great candidate
is the canvas `map` contained within `MapState`.
- This function has line `map = state.units.map`, which is equivalent to
`editor.mapState.map` and each `Layer`'s `map`. 
- Encouraging global variables may also help with clarity, by reducing
the need to nest functions.
- The `NumberMarkers` function generates a new instance variable for
`Editor`. It would be nice to see all `Editor` instance variables
defined at once so that `Editor` is easier to conceptualize. In fact, we
may also be able to generate number-icons at 'Editor' initialization
here. 
- Note that exceptions for Louisiana, Mass. Towns, Indian Precincts and
El Paso, TX is hard coded in the code. Perhaps a global 'placeID'
function could consolidate or correction of Louisiana data could
consolidate this. 
- Icons are generated using Javscript Canvas. Could these also be
generated SVG or even CSS to simplify the code? 
- `colorsAffected` is a parameter sent to the `updated` but doesn't
appear passed when into the function when it is called. Is
`colorsAffected` also equivalent to `brush.changedColors`?
- `Layer` is used to describe its specification object as a parameter to
new  objects of `Layer` class. Would it be clearer to call this
parameter `layerspecs`? 
- GET functions can only process up to 100 district when generating
district centroids.
- A simple way to select 100 random objects in a list is through taking
a slice of `[...array].sort(() => 0.5 - Math.random());`. For the
largest numbers, this method is not terribly fast or evenly distributed
but is very simple.
- Meanwhile, it appears that `check_district(d_index)` only checks one
district at a time. This implies that the selection of 100 random
districts should occur before and outside the function. 

## 03

### Actions Reducers
Many reducer functions are listed in `utils`. They're relatively simple. Can they be
listed in the `reducers/` folder for clarity instead?

### BrushEraseTools
- The const that stores the `BrushTool` icon is a function that takes in parameters, but
whose output is never changed. This must be vestigial from an experiment where we changed
the rendered tool icon based on state.
- We should go ahead and set a default value for the `renderToolbar` parameter in `BrushToolOptions`,
as it is always set to `undefined` when it is called. In fact, it is called in each of the `BrushToolOptions`'
instance methods and is ultimately set to re-render the Editor when the `BrushTool` is added by to the
`Toolbar` by the `addTool(...)` function. 

### Modal

- Small snippets of code is saved in a multitude of html files and folders. Could this be combined as
say, a JSON, for simplicity?
- `savePlanToDB1` is passed into the `renderSaveModal(...)` by `Toolbar`, but this is the same 
function as in `routes`. Could this be made into a global method?

### Tool
Should we set a default `hide-me` value `false` in the `Tool` constructor to be clear?

### Toolbar

May, 2021. @gomotopia
- If there is only one`Toolbar` object made and maintained, couldn't it be a global variable?
- Toolbar's `this.state`, is not initialized in the constructor.
- `setMenuItems(...)` is passed a copy of information from the `State` object by the plugins.
Couldn't it just render from its own reference to the single `State` object? 
- In `savePlan()`, `btn` is retrieved and defined three times near identically. Is there a difference
between these calls and can this function be rewritten to reduce this redundancy?
- Could `OptionsContainer` be renamed `ToolOptionsContainer` for clarity?
- Tabs are only effectively called here, yet is passed in `this.tabs`, `this.store.state`, etc.
Could tabs just be passed in `this,` the `Toolbar` and handle the rest?

### Tools Plugin

- The logic for selecting which tools to plug in, based on `state.problem`, `spatial_abilities` and more, are scattered throughout
the code. Is there a way to consolidate this logic?
  - In `view/edit.js`, before the `State` is created, `context.problem.type` determines the list of plugins to load. No matter the
 logic, `tools-plugin` is always loaded, while other plugins are swapped in and out.
  - Within ` tools-plugin`, different kinds of `Brush` are created whether the `state.problem.type` is community or not. 
  - If `state.problem.type` is communtiy, the `LandmarkTool` is created.
  - `state.problem.type` is passed in as a `brushOption` even if the Brush is already of `CommunityBrush` or regular `Brush` type.
  - Contiguity Check and VRA does not apply in `community` mode
  - Menu words are chosen on `community` type
  For VRA
   - The`showVRA` option is defined twice. The `VRAEffectiveness` module is loaded if `vra` mode is applied. 
- Since the `Toolbar` is created in `Editor` after the `State` object is created and `Menu` only relies on problem/context
`State` to provide a list of menu options, should Menu functionality be separated out into a different file?

### Top Menu

`Menu` does so much by itself, I think it deserve a separate file from both the `Toolbar`, `tools-plugin.js`. The
menu and its options are loaded only once and the options change little from context to context.

### UI Componenets

### UI State Store

- If we use a series of dispatch events to rerender different pieces of the document, do we
need to call `renderToolbar` in the methods of `brushTool`? 
- Only the one, unchanging and  defined `reducer` is ever used. Does this ever need to be an
instance variable or passed around as a parameter between classes?
as a parameter between structures?
- In the `dispatch` function, each subscriber is passed a pair of parameters that are ultimately not
used by the subscribed function (which is only ever `editor.render`) 

## 04

### Brush

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

## 07

### State Portals

### Index

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

### Place Exceptions

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
