# Population Bar Chart

Originally written by [@maxhully] on Jan. 11, 2019, the
`PopulationBarChart`, found in
[`/src/components/Charts/PopulationBarChart.js`], is the main svg-style
chart found in the "Population" tab. It is updated as users paint
districts on a map. Function `populationBarChart` produces a section
class `.toolbar-section` that implements a `horizontalBarChart(...)`.

## horizontalBarChart(population, parts)

> The `horizontalBarChart` implemented here is different than the
`HorizontalBarChart.js` used in [`Tooltips`], that's html-based rather
than svg-based! 

The responsibility of the `horizontalBarChart` is to use `parts` to
create labels and `population` to create entries for an svg-style
horizontal bar chart. When created, this `population` argument usually
refers to `state.population` from the [`State`] object.

After calculating display-related constants, each piece of `data` is
created as an svg `rect` of calculated width, standard width calculated
from the `barHeight` function, an inivisible `title` with formatted
deviation and color fill based on part number. 

Finally, a printed line with label and ideal population, total
population divided by number of parts, is also printed in the svg. 

## Helper Functions

- Function `barLength(d, maxValue)` takes a datapoint's proportion of
its `maxValue` and scales it to global constant `width`. 
- The max display value is not necessarily the max data value. According
to function the `maxDisplayValue(population)` may be the max data value
or twice the ideal population value. 
- The following global consts are defined as display parameters
   - `defaultHeight`, standard height of the chart
   - `width`, standard width of the chart
   - `gap`, the standard gap between two bars
   - `extra`, a padding value for labels.

# # 

### Suggestions

- A reminder that `state.population` is not initialized in the initial
creation of the `state` object.
- Consts, hard-coded display settings, are defined as global variables,
could live instead in its own utils file..

# #

[Return to Main](../README.md)
- Plugins for Data
  - [The Data Layers Plugin](../06charts/datalayersplugin.md)
  - [Population Balance Plugin](../06charts/popbalanceplugin.md)
  - [The Evaluation Plugin](../06charts/evaluationplugin.md)
- Previous: [The Population Model](../06charts/population.md)
- Next: [Column-Sets and Parts](./06charts/columnsetsparts.md)
  - [Two ways to explore election results](../06charts/electionresults.md)
- [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[@maxhully]: http://github.com/maxhully

[`State`]: ../01contextplan/state.md
[`Tooltips`]: ../04drawing/tooltip.md

[`/src/components/Charts/PopulationBarChart.js`]: ../../src/components/Charts/PopulationBarChart.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA