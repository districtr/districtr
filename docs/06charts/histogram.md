# Histogram

One way to display information related to age ranges or income
is to present them using a Historgram. Histograms are implemented
either as [`AgeHistogramTable`]s or [`IncomeHistogramTable`]s and are
loaded in [`evaluation-plugin.js`] and [`multi-layers-plugin.js`]
respectively.

Individually, `AgeHistogramTable` and `IncomeHistorgramTable` generates
the important buckets each topic and renders additional user options and 
traditional tabular data tables around
the `Histogram`. 

This clever scheme, to make a chart with css style, was first developed
by [@mapmeld] for a "histogram on ages" on Wednesday, Apr. 20, 2020.

## [`src/components/Charts/Histogram.js`] 

The `Histogram`, a bar chart of frequencies, is a novel 
implementation fo the [`DataTable`]. As with each `DataTable`,
it has `headers`, an Array of `null` values of the length
of `subgroups` and different `rows`. 

Every `DataTable` `row` has a `label` and `entries`. As is
typical, the `label` of each row is the `renderLabel()` of each
drawn part. Every `entry` is a drawn column derived from
`getColumn(...)`. The median is also written out in text and given
special formatting as a column. 

### Subgroups

Subgroups outline each bucket whether by age or income. An example
subgroup is perhaps, those of age between 30-35. These are outlined
in further implementations of `Histogram`, whether by age or by income,
and futher processed in `histogram.js`. 

### getColumn 

The trick to Histogram is that instead of displaying entry elements
with values or percentages, a `div` of a certain background, width and
height, by pixel,  is rendered. Widths, in age, are related to the
number of years that span the subgroup and the height is related to the
proportion of population located within that group. 

Median, calculated in the default function, is represented by a change
of div background color for the relevant histogram subgroup.

# #

### Suggestions

There are only two kinds of Histograms, one for age and one for income.
They are used in separate plugins through two complete separate
functions. Thus, for clarity sake, logic around `isAge` could be
abstracted to the descendent function alone, leaving Histogram a more
generic object.

There are eight places where `isAge` is tested in Histogram. 

- The `AgeHistogram` is called but not used in muti-layers-plugin

- The `widthMultiplier` is practically redundant as it modifies hard
coded values for income and age histograms. It is always 1.5 and 1
respectively and modifies widths 44 and 2 respectively. Thus these
values could be hard coded 66 and 2 without `widthMultiplier`.

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
- [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - Previous: [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[@mapmeld]: http://github.com/mapmeld

[`evaluation-plugin.js`]: ../06charts/evaluationplugin.md
[`multi-layers-plugin.js`]: ../06charts/multilayersplugin.md

[`AgeHistogramTable`]: ../06charts/demographicstable.md
[`IncomeHistogramTable`]: ../06charts/demographicstable.md
[`DataTable`]: ../06charts/datatable.md

[`src/components/Charts/Histogram.js`]: ../../src/components/Charts/Histogram.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA