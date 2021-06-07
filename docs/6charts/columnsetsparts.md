# Column Sets

Column Sets are the principal way that tabular information is stored by districtr.
This elementary status is set so from the loading of each `plan/context`. When a 
`State` object is created, `state.columnsets` is populated by `getColumnSets(this, units)`
and `state.parts` is populated by `getParts(problem)`, both of which are populated by
`/src/models/lib/column-sets.js`. This function creates `Population` and `Election`
objects that both descend from the `ColumnSet` model class. 

The original documentation written by @maxhully is as follows. 

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
counted
- `parts`, different drawn districts
- `type`, whether election or otherwise

There's an additional helper function `sortSubgroups` applied if `sort`
is permitted. Another helper `sortable` determines if a `ColumnSet` is
sortable if each `subgroup` is of numerical type.

If `total` and `total_alt` are neither undefined or null, they are created
as their own `Subgroup` and assigned to `this.total` and `this.total_alt`
respectively. If `total` is null, then a new `SumOfColumns` object is
created and assigned to the instanc `this.total`.

Finally, the `this.update` function is bound to the object, which
calls `.update(...)` for each type of `subgroup` and `total`.

### The `Subgroup` and `SumofColumns` models

`Subgroup` is the sole descendent of `NumericalColumn` found
in `/src/models/NumericalColumn.js`, where `SumofColumns` also lives.

`NumericalColumn` is constructed with a `columnrecord` that keeps
track of its own `name`, `key`, `sum`, `min` and `max` to create
instance variables for the `NumericalColumn`. The object then also
provides a `getValue(feature)` function and other formatters.

`Subgroup` extends this by adding a `this.columnSet`, and
`this.total_alt` from its own construction parameters and a 
`this.data` instance variable initialized to zeroes. A variety
of other getters are available related to `total()`, fractional
values and demographic abbreviations. 

The `update` function is vital here. It takes a `feature` and
replaces its `color` with multi-assignment functionality.

_global abbreviations should be stored in one place_

`SumOfColumns` takes `columns`, `columnSet` and `parts` and 
mimics the functions of `Subgroup`, with an initialized `this.data`
while performing `min` and `max` calculations itself.

_SUmOfCoulumns should descend or be rolled into any of the other classes_

> Remember: the two descendents of 


### The functions of `column-sets.js`

_Everything here is hard coded, reducing flexibility!_

Returning to `column-sets.js` we notice that only two export functions
are listed, which, as we described, are both used by `State` in its
construction. 

Function `getColumnSets` creates the following instance variables from
corresponding functions.

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

Whereas `state.coumns` is an array that inlcudes `state.population.total`,
`state.population.subgroups` and `state.elections.reduce`. Then in a long
series of if statements, columns and subgroups within each of the above
categories are added to `state.columns`. 

`columnsets` is then created the same way and ultimately returned back
to `state`. 

_if statements repeat twice. better way to write this?_ 

_Should State handle the creation of its own instance variables. addColumn()?_

_is `columnsets` and `state.columns` the same thing?_

_why is lib its own folder?_ 

## The `Part` class

Within `column-set.js`, the `getParts(problem)` is used to populate the
parts in a `State`. For every district in a sequential list, a new
`Part` object must be created. This object is relatively simple, with 
the following parameters and instance variables.
- `this.id`, parameter, 0-indexed value
- `this.noun`, parameter of type of district, ward, etc...
- `this.displayNumber`, parameter, 1-indexed display number 
- `this.color`, parameter, from color.hex setting
- `this.hoverColor`, from color.hoverhex
- `this.visible`, default true. 

In addition `updateDescription({...})` updates instance variables `this.name` and
`this.description`. Function `serialize()` returns a JSON object with `id`,
`displayNumber`, `name` and `description` and `renderLabel` returns an html
span class `.part-number` which returns a colored icon. 

_this is a css value, but the map icons are canvas rendered._

_instance variables not intialized._ 





