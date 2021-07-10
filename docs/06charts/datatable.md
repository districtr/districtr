# DataTable

Written in [`/src/components/Charts/DataTable.js`], The `DataTable` is a
simple lit-html function that renders that creates a  table of class
`.data-table`. The function takes a `header`, various `rows` and an
optional `left_corner` parameter set default to top to create a `thead`
and `tbody` in html. It is used to format...
- [Election Results]
- Median Income
- [Demographics] 
- Partisan Summaries
- [VRA information and VRA results]
- [Historgrams]
- Pivot Tables, Coalition Pivot Tables
- and Feature tables.

## The Header Row

The `HeaderRow` is a lit-html function that takes variable names
and the option for the `left_corner`. Unless `left_corner` is true,
a dummy th is opened and closed. Then, for each variable name, 
a th is created of class `.data-table__column-heading` is created.
If there is only one variable name in the list, this header cell spans
two columns. 

## Cells

Each row is a collection of `Cell`s, which are themselves the result of
the lit-html `Cell` function, which takes an object pair of `content`
and `style`. When `DataTable` creates a row, a tr is created and a th of
class `data-table__row-heading` is created to render the `row.label`.
Then, for each `row.entries`, the Cell function is called, creating a td
of style `style` and content. 

Thus, `Cell` is a wrapper of td ensuring class `.ui-data` and
`data-table__cell` with passed in content and style.

> Argument `header` is simply a list of variable names. Each row has a
`row.label` and a `row.entry` which is an object
{`content` and `style`}.

# Pivot Table

The `PivotTable` is sort of an extension of the `DataTable` used when
drawing communities, as it is only called by the [`community-plugin`] to
represent Population or VAP. 

## Helper Functions

To help in the creation of `PivotTable`s and `DistrictEvaluationTable`s
described below, there are helper functions like `getCellStyle(value)`
which generates a gray-scaled background color based on parameter
`value`, `getCell(value)` which creates an object with pair `content`
and `style`, and `getEntries(subgroup, part)` which creates cells that
generate district and overall fractions.

Function `getBackgrounColor` is used by `getCellStyle` and its original 
documentation by [@maxhully] is printed below. 

```
/**
 * We want the background color to be #f9f9f9 when value = 0, and black when
 * the value = 1. #f9f9f9 is the same as rgba(0, 0, 0, 0.02), so we map the 0-to-1
 * value scale to the 0.02-to-1 alpha scale.
 * @param {number} value - the subgroup's share of the district's population
 *  (between 0 and 1)
 */
```

## The `PivotTable` Function
The `PivotTable` function is called when needed by the
`community-plugin` and  is used to represent both Population and VAP. 

### Contruction
 
The constructor takes a series of parameters. For our example, we will
consider as it is constructed to represent Population, one of only two
ways the PivotTable is used. Parameters include...
 - A `chartId`, the common name of the table like "Population"
 - A `columnSet`, like `state.population` 
 - A place name, like `state.place.name.`
 - The `parts` or drawn communities, `state.parts` 
 - And whether [`spatial_abilities`] permits [coalitions]. 

In addition, `PivotTable` takes a `uiState` and `dispatch` to include
functionality.

If `coaltionEnabled`, a `mockColumnSet` must be created to keep track of
coalition tallies. First, the coaltion groups stored by
`window.coaltionGroups`, selected using the chekboxes in the Coalition
Section of the Toolbar, are stored in an array known as `mockData`. This
`mockData` is fleshed out into a `coalitionSubgroup`, akin to the
`Subgroup` model with its own `key`, `name` and abbreviation and
fraction part functions. This subgroup is then merged with the standard
`columnSet` into a new `mockColumnSet` object.

### Rendering

Inside the [`Toolbar`], within a new section of class `toolbar-section`,
if there are any visible parts to show, a `Select` of visible parts is
created within a [`Parameter`] class. Finally, a
`DistrictEvaluationTable` is rendered. 

## The District Evaluation Table

The `DistrictEvaluationTable` function is included in `PivotTable.js`
and is used by both the `PivotTable` and the `CoalitionPivotTable`. In
essence, it is simply a `DataTable` with generated headers and rows. 

Its headers us simply an array of the `part.name` or
`part.renderLabel()` and the `placename`. The rows start with the
`total`s of columnSet data and sum. Then, each subgroup is given a row
with a `label`, the subGroup abbreviation, and entries for each `part`. 

# Coalition Pivot Table

The `CoalitionPivotTable` is another version of a `PivotTable` that is
called in `data-layers-plugin.js`. It reimplements much of what is in
`PivotTable` with the added benefit of calculating district totals, but
is always set when created by the plugin with `totalonly` set to true.
This means that the user is presented a simple table that only shows
state and coalition totals. 

# #

### Suggesstions

The `PivotTable` and the `CoalitionPivotTable` are both very similar
implementations of `DataTable`. Is there a way that
`CoalitionPivotTable` could inherit from `PivotTable` or extend
`PivotTable` to include coalition properties?

- `CoalitionPivotTable` is called in `CommunityPlugin` and
`EvaluationPlugin` but is not used. It is created only once in
`DataLayersPlugin`
- Thus, `totals_only` in `CoalitionPivotTable` is only set to true, 
making `CoalitionPivotTable` even more similar to `PivotTable`

# #

[Return to Main](../README.md)
- Plugins for Data
  - [The Data Layers Plugin](../06charts/datalayersplugin.md)
  - [Population Balance Plugin](../06charts/popbalanceplugin.md)
  - [The Evaluation Plugin](../06charts/evaluationplugin.md)
- [The Population Model](../06charts/population.md)
- [Population Bar Chart](../06charts/populationbarchart.md)
- [Column-Sets and Parts](./06charts/columnsetsparts.md)
  - [Two ways to explore election results](../06charts/electionresults.md)
- Here: [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[@maxhully]: http://github.com/maxhully

[`/src/components/Charts/DataTable.js`]: ../../src/components/Charts/DataTable.js

[`Toolbar`]: ../03toolsplugins/toolbar.md
[`Parameter`]: ../03toolsplugins/uicomponents.md

[`community-plugin`]: ../05landmarks/communityplugin.md

[coalitions]: ../06charts/datalayersplugin.md
[Election Results]: ../06charts/electionresults.md
[Demographics]: ../06charts/demographicstable.md
[Historgrams]: ../06charts/histogram.md
[VRA information and VRA results]: ../06charts/vra.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA