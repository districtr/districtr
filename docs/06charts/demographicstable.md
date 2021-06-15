# Demographics Table

The `DemographicsTable` is a specific implementation of `DataTable`
where columns are specifically units of population like race and
rows are specifically different drawn parts. It is sometimes used
on its own and sometimes extended further with more user options. 

By itself, the `DemographicsTable` is called in `community-plugin`
and `multi-layers-plugin` where it represents "Homeowner or Renter"
or "Education: data in a table. While it is imported in the `data-layers-plugin`,
it is never called.

Instead, it is used more often, extended by `RacialBalanceTable`
and `AgeHistogramTable` in the `evaluation-plugin`. 

That `DemographicsTable` can be considered an extension of `DataTable`,
it is a sibling of the `PivotTable`. 

## src/components/Charts/DemographicsTable.js 

Since the `DemographicsTable(...)` function ultimately returns html
formatted by the `DataTable(headers, rows)`, it generates special
`headers` and `rows` using parameters `subgroups`, `parts` and special
format variable `decimals`, defaulted to true. 

The `headers` are simply the name of each `subgroup` formatted correctly,
e.g. "White", "Black", "Hispanic", etc...
Each row has two parts, `label` and `entries`, where the `label` is an
icon representing each district and the entries are the contents of 
each subgroup (i.e. demographic), given a `part`, formatted according
to `decimals`. 

### Helper Functions

Like many similar table types, `getBackgroundColor` and `getStyle`
are defined in identical fashion. Additional number formatter 
`popNumber` appends an M or k, million or thousand, abbreviation if
important. 

Thus, when we get to `getCell(...)`, we now have three options for
representing data in a cell. Cell values could either be a percentage
with `decimal` `true` or `false` setting the number of significant
figures. If "population" is set instead, a formatted population 
nubmer is written in each cell. 

### Rendering 

`DemographicsTable` is a function that takes `subgroups`, `parts`
and calls data `DataTable` to generate HTML to be displayed. As such,
headers and rows must be generated for `DataTable`. The `headers` are
labels of subgroups, e.g. "White", "Black", "Hispanic", etc. Rows
correspond to each district, drawn or to be drawn, in the context/problem.
Each entry is a call to `getCell`, which derives data for a given
`subgroup` and `part`, formatted with respect to `width` and `decimals`
option. 

Finally, an `Overall` line is created representing data for the entire
area, which we get by using `null` instead of a district as the part we
ask `getCell` to render.

Also note, that function variable `width`, the width of each individual
cell, is related to the total number of subgroups. 

## The `RacialBalanceTable`

src/components/Charts/RacialBalanceTable.js

One way to extend `DemographicsTable`'s functionality is by writing functions
that combine UI options with a demographics table. This is done in the `RacialBalanceTable`, called by the `evaluation-plugin` for the Evaluation Tab.

Whether used for Population, VAP or CVAP in their own respective Reveal Sections,
`RacialBalanceTable`s takes...
- a `chartID`, the displayed title,
- a `population` object like `state.vap`,
- `parts`, drawn districts like `state.activeParts`,
- `chartstate`, the charts representation in the `uiState`,
- and `dispatch`, likely `store.dispatch`

> Per the `evaluation-plugin`, when Population is used, a new column is made
for user selected coalitions, included in the `mockColumnSet` sent to
`RacialBalanceTable` as the `population` parameter.

The purpose of the racial balance table is to allow users to select up to 
three demographic groups using `SelectBoxes`, a labelled series of drop-downs
with `Parameter`s and dispatchers that modifies reducer `chartState.activeSubgroupIndicies`. 

Upon rendering, selected subgroups are collected from `chartState`, which are
sent to a `DemographicsTable` that displays only up to three of these demographics.

## Used in AgeHistogramTable

src/components/Charts/AgeHistogramTable.js 

The `AgeHistogramTable` is a bit more complicated and relies on the `Histogram`
object as well as `DemographicsTable`s. Rather than racial categories, the
subgroups here are now age ranges. Components of this type are only used when 
there exists `state.ages` population data associated with maps that use Census
Block Group type units in certain states like North and South Dakota. 

There are three ways to view age data, by Percentage, by Population and by
Histogram. The `DemographicTable` is used if Percentage or Population is desired,
by setting argument `decimals` as `false` or `population` respectively. If
Histograms are desired, a `DataTable`-derived `Histogram` object is rendered. 

Within this script, hard coded variable `combinedAges` are created with default
names and census-derived keys. This array of objects are then fleshed out to "mimic"
the `Subgroup` model by providing `sum`s and `total` objects broken down by drawn
part. 

# #

### Suggestions

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
