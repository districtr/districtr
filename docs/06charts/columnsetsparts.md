# Column Sets

Column Sets are the principal way that tabular information is stored by
districtr. The root of each principal Column Sets is planted as early as
the loading of a [`plan/context`]. When a  [`State`] object is created,
`state.columnsets` is populated by `getColumnSets(this, units)` and
`state.parts` is populated by `getParts(problem)`, both of which are
populated by [`/src/models/lib/column-sets.js`]. This function creates
[`Population`] and [`Election`] objects that both descend from the
`ColumnSet` model class. 

The original documentation written by [@maxhully] is as follows. 

```
// This module provides functions that creates Part and ColumnSet (Election
// and Population) objects from the Place and DistrictingProblem records
// provided from the backend (specified in the YAML config files used when
// generating tilesets). This is currently a sort of ad hoc process, where
// we identify Population and VAP based on the ColumnSet type and name,
// and Elections by their type ("election"). These are saved as
// `state.population` and `state.vap`, respectively.

// In the future, it would be better to just create the ColumnSets based
// on their type without handling them as special cases (so `state.vap`
// would not exist, just `state.columnSets` or something). We would
// want to configure what charts and overlays we want available for
// each type of ColumnSet somewhere---maybe in the records for the place's
// Districtr module, or just within the codebase.

// The idea is that we should be able to add more ColumnSets (e.g. Under-18
// Population) without having to go through all the places in the code
// where we use `state.vap` and add code handling `state.under18` or
// something.
```

As we saw before, `state.columnsets` was created after this description
and encompasses vap and other cases. 

## The `ColumnSet` Model

The `ColumnSet` is a collection of `Subgoup`s a `SumOfColumns` numerical
column. 

Each `ColumnSet` object takes the following parameters...
- `subgroups`, parties or demographics
- `total`, totals given from the `context/plan` specification
- `total-alt`, totals related to how absentee ballots are decided to be
counted and some 2018/2019 toggling.
- `parts`, different drawn districts
- `type`, whether election or otherwise

There's an additional helper function `sortSubgroups` applied if `sort`
is permitted. Another helper `sortable` determines whether a `ColumnSet`
is sortable by checking if each `subgroup` is of numerical type.

If `total` and `total_alt` are neither undefined or null, they are
created as their own `Subgroup` and assigned to `this.total` and
`this.total_alt` respectively. If `total` is null, then a new
`SumOfColumns` object is created and assigned to the instance's
`this.total`.

Finally, the `this.update` function is bound to the object, which calls
`.update(...)` for each type of `subgroup` and `total`.

### The `Subgroup` and `SumofColumns` models

`Subgroup` is the sole descendent of `NumericalColumn` found in
[`/src/models/NumericalColumn.js`], where `SumofColumns` also lives.

`NumericalColumn` is constructed with a `columnrecord` that keeps track
of its own `name`, `key`, `sum`, `min` and `max` to create instance
variables for the `NumericalColumn`. The object then also provides a
`getValue(feature)` function and other formatters.

`Subgroup` extends this by adding a `this.columnSet`, and
`this.total_alt` from its own construction parameters and a `this.data`
instance variable initialized to zeroes. A variety of other getters are
available related to `total()`, fractional values and demographic
abbreviations. 

The `update` function is vital here. It takes a `feature` and replaces
its `color` with multi-assignment functionality.

`SumOfColumns` takes `columns`, `columnSet` and `parts` and  mimics the
functions of `Subgroup`, with an initialized `this.data` while
performing `min` and `max` calculations itself.

> Remember: there are two classes of `NumericalColumns`, `Subgroup`
which descends from it and `SumOfColumns` which does not, but is defined
in the same file.

### The functions of `column-sets.js`

Returning to `column-sets.js` we notice that only two export functions
are listed, which, as we described, are both used by `State` in its
construction: `getParts(...)` and `getColumnSets(...)`

Function `getColumnSets(...)` creates the following instance variables
from corresponding functions.

- `state.elections`
- `state.population`
- `state.vap`
- `state.cvap`
- `state.ages`
- `state.incomes`
- `state.median_income`
- `state.rent`
- `state.broadband`
- `state.snap`
- `state.asthma`
- `state.education`
- `state.voters`

Whereas `state.columns` is an array that first inlcudes
`state.population.total`, `state.population.subgroups` and
`state.elections.reduce`. In a long series of if statements,
columns and subgroups within each of the above categories are added to
`state.columns`. 

`columnsets` is then created the same way and ultimately returned back
to `state`. 

## The `Part` class

Within `column-sets.js`, the `getParts(problem)` is used to populate the
parts in a `State`. For every district in a sequential list, a new
`Part` object must be created. This object is relatively simple, with 
the following parameters and instance variables.
- `this.id`, parameter, 0-indexed value
- `this.noun`, parameter of type of district, ward, etc...
- `this.displayNumber`, parameter, 1-indexed display number 
- `this.color`, parameter, from color.hex setting
- `this.hoverColor`, from color.hoverhex
- `this.visible`, default true. 

In addition `updateDescription({...})` updates instance variables
`this.name` and `this.description`. Function `serialize()` returns a
JSON object with `id`, `displayNumber`, `name` and `description` and
`renderLabel` returns an html span class `.part-number` which returns a
colored icon. 

> Remember, there are two ways the part icons are rendered, through css
when created using `part.renderLabel()` and using canvas when adding
them to the mapbox-gl `map`.

# # 

### Suggestions

- Constant `ABBREVIATIONS` is kept by the `Subgroup` class, but
abbreviations and other utilities should be kept together in a utils
file. 
- Class `SumOfColumns` is so similar to `NumericalColumn` and `Subgroup`
that it could extend or be rolled into one of these classes
- It's natural for `column-sets.js` to list all possible columns, but
since each possible columnset is hard coded, lots of work is necesssary
if we were to add a new data type. This is alluded to in the original
documentation.
- In function `getColumnSets(...)`, if statements check each type of
columnset, like `if (state.vap)` twice. Could this condition be folded
into itself so that it is called once?
   - Actually, within this function, what's the difference between
   `state.columns` and the `columnsets` array? 
- Philosophically, I think `State` should be responsible for the
addition of its own columnsets with a function like `addColumnSet(...)`.
I also think that state should initialize blank versions of any of its
instance variables at the onset for clarity's sake.

- Why is `src/models/lib` its own folder

# # 

[Return to Main](../README.md)
- Plugins for Data
  - [The Data Layers Plugin](../06charts/datalayersplugin.md)
  - [Population Balance Plugin](../06charts/popbalanceplugin.md)
  - [The Evaluation Plugin](../06charts/evaluationplugin.md)
- [Population Bar Chart](../06charts/populationbarchart.md)
- Here: [Column-Sets and Parts](./06charts/columnsetsparts.md)
  - [Two ways to explore election results](../06charts/electionresults.md)
- [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/higglightunassigned.md)
- [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[@maxhully]: http://github.com/maxhully

[`plan/context`]: ../01contextplan/plancontext.md
[`State`]: ../01contextplan/state.md

[`Election`]: ../06charts/electionresults.md
[`Population`]: ../06charts/population.md


[`/src/models/lib/column-sets.js`]: ../../src/models/lib/column-sets.js
[`/src/models/NumericalColumn.js`]: ../../src/models/NumericalColumn.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA