# Histogram

One way to display information related to age ranges or income
is to present them using a Historgram. Histograms are implemented
either as `AgeHistogramTable`s or `IncomeHistogramTable`s and are
loaded in `evaluation-plugin.js` and `multi-layers-plugin.js`
respectively.

Individually, `AgeHistogramTable` and `IncomeHistorgramTable` generates
the important buckets each topic and renders additional user options and 
traditional tabular data tables around
the `Histogram`. 

This scheme was first developed my [@mapmeld] for a "histogram on ages"
on Wednesday, Apr. 20, 2020.

_age called but not used in muti-layers-plugin_

## `src/components/Charts/Histogram.js` 

The `Histogram`, a bar chart of frequencies, is a novel 
implementation fo the `DataTable`. As with each `DataTable`,
is has `headers`, an Array of `null` values of the length
of `subgroups` and different `rows`. 

Every `DataTable` `row` has a `label` and `entries`. As is
typical, the `label` of each row is the `renderLabel()` of each
drawn part. Every `entry` is a drawn column derived from `getColumn(...)`.
The median is also written out in text and given special formatting
as a column. 

_if (isAge) could be abstracted higher_

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

_width multiplier is only used by income, at 1.5 and is redundant, as
it is hard coded in get_column and seems to be written for income alone._
_isAge is there up to 10 different times_
