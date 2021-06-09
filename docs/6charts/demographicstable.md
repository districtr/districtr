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

_Demographics Table imported but not called!_ 

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

_get background color and getCellStyle are redundant! all this and
popNumber can be collected in utils._ 

### Rendering 

Each district serves as its own cell 

Takes (subgroups, parts, decimals=true)

decimals couls be 'population' 

Makes headers, labels of subgroups, White, Black, Hispanic, etc...

Rows, renderLabel of part, getCell 

_decimals false true or population? unclear._
_part !=== null can just be part ?_

Adds overall row, where part is null, thus overall.

_Shows even empty districts, doesnt hide in  histograms and large area._

## The `RacialBalanceTable`


One way to extend `DemographicsTable` is by using it to create a
`Racial alance table.

used in evaluation-plugin 

Use of Select boxes, Compare up to three demographic groups
or coalition. 

actions.selectSubgroup

_special case for includes 2018 and includes 2019_


## Used in AgeHistogramTable

More complicated. Usually, when we have Block Groups. For instance,
North and South Dakota.

Or Histogram 

_No overall_

