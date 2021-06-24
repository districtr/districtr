# The Population Class

The `Population` Class is a descendent of the [`ColumnSet`] class, which
makes it a simpler sibling of the [`Election`] class. It is found in
[`src/models/Population.js`].

## Constructor

Just as `ColumnSet` does, `Population` takes `subgroups`, a `total`,
a `total_alt` and `parts` usually found in the original [context/plan].
In addition, it takes a `name` and the name for its alternative, 
`name_alt`, used for specific absentee-total interpretations. These
final two are set as instance variables.

In addition, an ideal value, `this.ideal`, calculates an ideal
district size presuming equality among all districts of the areas
total population and a formatted version, `this.fomattedideal.`

## Instance Functions

Both `deviations()` and `indiciesOfMajorSubgroups()` are bound
functions of each object.

The `deviations()` function simply
returns a list of the difference between a district's total and
the ideal value as a percentage of the ideal population. 

In addition to the claim in the original documentation for
`indiciesOfMajorSubgroups()` below, subgroups whose name
includes 2018 and 2019 is also excluded, and only three
groups are always returned.

```
/**
 * Returns the indices of all subgroups with more than 5% of the total
 * population, sorted largest-to-smallest.
 */
 ```

# #

### Suggestion
Both `indiciesOfMajorSubgroups()` and `RacialBalanceTable` filter out
2018 and 2019 data. Could this be consolidated?

[Return to Main](../README.md)
- Plugins for Data
  - [The Data Layers Plugin](../06charts/datalayersplugin.md)
  - [Population Balance Plugin](../06charts/popbalanceplugin.md)
  - [The Evaluation Plugin](../06charts/evaluationplugin.md)
- Next: [Population Bar Chart](../06charts/populationbarchart.md)
- [Column-Sets and Parts](./06charts/columnsetsparts.md)
  - [Two ways to explore election results](../06charts/electionresults.md)
- [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[`src/models/Population.js`]: ../../src/models/Population.js
[`ColumnSet`]: ../06charts/columnsetsparts.md
[`Election`]: ../06charts/electionresults.md
[context/plan]: ../01contextplan/plancontext.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA