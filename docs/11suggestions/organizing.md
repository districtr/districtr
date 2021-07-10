# A Tighter Organization

As district has grown, different pieces have bloomed to the point that
some of their responsiblities have blurred. Some pieces do work that
should be logically one in another, 

Some of this is the result of temporary structures early in the code
that haven't been revisited, or the anticipation of greater uses for a
snippet that doesn't come to fore. 

In general, my [Philosophy] tell me that good functions are those
- well documented
- who only performs a handfull of tasks
- that liberally use callbacks and helpers.

## The Big Ideas

### The [State] Object

On Mon., Apr. 22, 2019, [@maxhully] suggested that the [`State`] class
be broken up. His original comment is below.

```
// We should break this up. Maybe like this:
// [ ] MapState (map, layers)
// [ ] DistrictData (column sets) ?
// [x] DistrictingPlan (assignment, problem, export()) ?
// [ ] Units (unitsRecord, reference to layer?) ? <--- really need this
one
// "place" is mostly split up into these categories now.
```
Currently one (maybe two) of these four items have been implemented.
One day soon, perhaps the [`State`] an be seen as a man-o-war collection
of different sub class instances.

Finally, `State.initializeMapState(...)` calls and returns from only one
function. This strikes to the heart of an important questions we'll ask
again and again: who should be responsible? In this case, would it be
easier for the [MapState] to initialize itself? 

### [Plugins]

I think each plugin should have a 1-to-1 relationship with each [Tab].
In essence, each mode, including VRA, which should be promoted, should
have its own list of plugins. These plugins may be very similar to each
other or may not be, but we should remove any conditions on `coi` mode
within each plugin. We must simply absolve them of that responsbility. 

> We can create an object to handle the label differences between
`Communities` and `Districts`.

In the [`Evaluation Plugin`], for instance, when [`VRA`] is activated,
both a `VRA` tab and an `Evaluation` is created!

Thus, since [`ToolsPlugin`] is so dominant, it should be promoted to
manager and `coi`, `default` and `vra` should have its own dedicated
plugins. In fact, this would make it easier to add new modes in the
future.

### Making [Layer]s

Given the nearly two dozen ways layers are created, there's surely a
way to categorize and standardize the creation of layers with a more
predictable form. Perhaps, since layers are stored in `editor.layers`,
we can create an `addLayer(...)` function here. 

In reality, `MapState` should really hold all `Layers` to absolve 
the `State` and the `Editor` from keeping track of them. 

## Misplaced Efforts

Often times, functions must be imported from different files when
they're only used in another. Placing functions in their natural home
makes it easy to trace bugs and build features because deveopers are now
saved from tracing the sprawl. It also keeps files uncluttered with
tangentially related snippets of code. These include...

- many reducer functions are listed in [`utils.js`]. They're relatively
simple. Can they be listed in the [`reducers/`] folder for clarity
instead?
- The [`PopBalancePlugin`] creates a function, `zoomToUnassigned` that
is always used with [`HighlightUnassigned`]. Thus, it makes more sense
to have that function placed with the unassigned functions. 
  - In addition both `Population Deviation` and `Unassigned Population`
  caluclations are short and can be combined with its plugin. (Unless
  we use them elsewhere in the code, then they're... utilities? data
  calculators?)

Other times, functions seem to go the long way when they don't need to.

- If we use a series of dispatch events to rerender different pieces of
the document, do we need to call `renderToolbar` in the methods of
`brushTool`? 
- Long vs. Short Tab titles are based on `VRA`. Could we uncouple this
from `VRA` and instead condition this on the number of tabs?
- `ColumnSets` hard codes every possible column. 

Philosophically, I think `State` should be responsible for the
addition of its own columnsets with a function like `addColumnSet(...)`
rather than having other functions intialize instance variables upon it.
I also think that state should initialize blank versions of any possible
instance variables at the onset for clarity's sake.

### Server and Files

Districtr relies on souricing data from its internal assets folder and
external databases and server functions.  Small snippets of content is
saved in a multitude of html files and folders for [landing pages],
[`DataSetInfo`] and [`Modal`]s. Could short pieces of content for each
state be combined as say, a JSON, for simplicity?

Meanwhile, there should only be one way we talk to the server.
Originally, the [`routes.js`] file was for navigating between pages in
the site. In time, it grew to talk to external servers like
PythonAnywhere. However, other functions also talk directly to external
services like...

- [PopBalancePlugin]
- [Contiguity.js]
- and [NumberMarkers].

Let's consolidate them in one file, `routes.js` or othewise.

## Consolidating Parts

Sometimes similiar pieces of code are cut and pasted rather than
abstracted out into helper functions. 

- In `savePlan()`, located in the [`Toolbar`], `btn` is retrieved and
defined three times near identically. Is there a difference between
these calls and can this function be consolidated?
- Function `placeItems(...)` was once used in [`PlacesList`] but is now
only used when view `event.js` produces html cards for plans. Could this
be similar to the cards already generated in landing pages elsewhere?
- Many table types reimplement `getBackgroundColor` and `getCellStyle`
identically. This, along with the `popNumber` formatter can be collected
in its own [`utils.js`] file. 
- Described in [`utils.js`], some functions may benefit from using 
`bindAll(...)`

### Looking at colorfeatures(...)

The act of coloring features in [`Brush`] requires two separate
functions. This action is a big deal and underpins the entire districtr
system. However, these two functions could be consolidated together
as...
  - `colorfeatures(...)` only creates a filter and calls 
  `_colorfeatures(...)`
  - while `_colorfeatures(...)` does everything else. 

Meanwhile, `_colorfeatures(...)` is tasked with both coloring units
and whole counties, along with the machinery required to caluclate
and color a unit's county. This function could be separated into two
functions with many helpers for units and for counties. 

Finally in brush, every time `this.changedColors` is cleared, it is
pointed to a  `new Set()` javascript object, which starts out empty.
This creates many `Set` objects with each use. Though the memory savings
on reusing= the same object are miniscule, wouldn't it be clearer to use
function `clear(...)` on the original object?

### Birds of a Feather

Finally, many classes and functions are so related to other ones that
they could and should be merged or subclassed. 

> Object classes inherit from one another, whereas functions can nest as
components.

- In the [DataTable], should the `coalitionSubgroup` inherit from the
`Subgroup` as a base class?
- In the [Pop Balance Plugin], single and multimember districts are
similar. Perhaps we could save some code by using in-line if statements.
- Regarding [ColumnSet]s, class `SumOfColumns` is already in the same
file as `NumericalColumn`, an inheritor of `Subgroup`. Could this extend
or be rolled into one of these classes?
- Why is `src/models/lib` its own folder?
- [`PivotTable`] and the [`CoalitionPivotTable`] are both very similar
functions that call [`DataTable`]. Is there a way they could be made
more similar by having `CoalitionPivotTable` "inherit" `PivotTable` or
extend `PivotTable` to include
coalition properties?
  - Note that `totals_only` in `CoalitionPivotTable` is only set to
  true, making `CoalitionPivotTable` even more similar to `PivotTable`.

Sometimes, pieces of code have been written that look similar to
elements that already exist. These hard-coded functions probably predate
the generic objects. 

- In [`PartisanOverlayContainer`], a checkbox element is hard coded.
Could we use the [`Toggle`] object instead?

## Big Fish

Somtimes, small features in some classes grow with such functionality
that it is better to make them their own file or entity- big fishes in
small ponds.

### [Top Menu]

`Menu` does so much by itself, I think it deserve a separate file from
both the `Toolbar`, `tools-plugin.js`. The menu and its options are
loaded only once and the options change little from context to context.

### [Histogram]

There are only two kinds of Histograms, one for age and one for income.
They are used in separate plugins through two complete separate
functions. Thus, for clarity sake, logic around `isAge` could be
abstracted to the separate functions alone, leaving Histogram a more
generic object.

## Helpers

I believe that many more, well documented helpers are vital for getting
a clear handle on what the code does.

- In [`Landmarks Class`], should the listeners in the constructor be
deanonymized and turned into helper functions?
- In the [`Demographics Table`] `mockColumnSet` can be written as its
own helper function in `evaluation-plugin.js`. 
- In the [EvaluationPlugin], initial `isOpen` states can be delegated to
a helper function.
- When rendering [state pages], so many anonymous functions are used
to render `html`. Perhaps a few longer ones can be separated out as
helper functions
- In [routes.js], so much occurs when `loadPlanFromJSON(...)` and
`loadPlanFromCSV(...)` returns the response from `listPlaces`, that
helper functions could be  written to help clarity.

# #

[Return to Main](../README.md)
- [My Personal Philosophy on Functions](../11suggestions/philosophy.md)
- [Deprecations and Experimental Features](../11suggestions/deprecations.md)
- [Clarifying Operations](../11suggestions/clarity.md)
- Previous: [Logical Redundancies](../11suggestions/logic.md)
- Next: [The Heavy Lift: (Not) Global Objects](../11suggestions/globalobjects.md)
- [Other Notes](../11suggestions/other.md)

[@maxhully]: http://github.com/maxhully

[`State`]: ../01contextplan/state.md
[State]: ../01contextplan/state.md

[Layer]: ../02editormap/layer.md
[MapState]: ../02editormap/map.md
[`PartisanOverlayContainer`]: ../02editormap/layeroverlay.md
[NumberMarkers]: ../02editormap/numbermarkers.md

[Plugins]: ../03toolsplugins/plugins.md
[Tab]: ../03toolsplugins/uicomponents.md
[`ToolsPlugin`]: ../03toolsplugins/toolsplugin.md
[`Modal`]: ../03toolsplugins/modal.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[`Toggle`]: ../03toolsplugins/uicomponents.md
[Top Menu]: ../03toolsplugins/topmenu.md
[routes.js]: ../03toolsplugins/uicomponents.md
[`reducers/`]: ../03toolsplugins/actionsreducers.md

[`Brush`]: ../04drawing/brush.md
[Contiguity.js]: ../04drawing/contiguity.md

[`PlacesList`]: ../05landmarks/findplaces.md
[`Landmarks Class`]:  ../05landmarks/landmarksclass.md

[PopBalancePlugin]: ../06charts/popbalanceplugin.md
[`PopBalancePlugin`]: ../06charts/popbalanceplugin.md
[`EvaluationPlugin`]: ../06charts/evaluationplugin.md
[Evaluation Plugin]: ../06charts/evaluationplugin.md
['DataSetInfo`]: ../06charts/datasetinfo.md
[`HighlightUnassigned`]: ../06charts/highlightunassigned.md
[`VRA`]: ../06charts/vra.md
[DataTable]: ../06charts/datatable.md
[Pop Balance Plugin]: ../06charts/popbalanceplugin.md
[ColumnSet]: ../06charts/columnsetsparts.md
[`PivotTable`]: ../06charts/demographicstable.md
[`CoalitionPivotTable`]: ../06charts/demographicstable.md
[`DataTable`]: ../06charts/datatable.md
[Histogram]: ../06charts/histogram.md
[`Demographics Table`]: ../06charts/demographicstable.md
[EvaluationPlugin]: ../06charts/evaluationplugin.md
[`Evaluation Plugin`]: ../06charts/evaluationplugin.md
[`DataSetInfo`]: ../06charts/datasetinfo.md

[landing pages]: ../07pages/districtrstatepages.md
[state pages]: ../07pages/districtrstatepages.md

[`routes.js`]: ../09deployment/routes.md

[`utils.js`]: ../10spatialabilities/utils.md

[Philosophy]: ../11suggestions/philosophy.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
