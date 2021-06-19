# Population Bar Chart

The `PopulationBarChart` found in `/src/components/Charts/PopulationBarChart.js`
was originally written by [@maxhully] on Jan. 11, 2019 and is the main svg-style
chart found in the "Population" tab. It is updated as users paint districts
on a map. Function `populationBarChart` produces a secion class `.toolbar-section`
that implements a `horizontalBarChart(...)`.

## horizontalBarChart(population, parts)

> The `horizontalBarChart` implemented here is different than the `HorizontalBarChart.js`
used in `Tooltips`, that's html-based rather than svg-based! 

The responsibility of the `horizontalBarChart` is to use `parts` to create labels
and `population` to create entries for an svg-style horizontal bar chart. When created,
this `population` argument usually refers to `state.population`.

After calculating display-related constants, each piece of `data` is created as
an svg `rect` of calculated width, standard width calculated from the `barHeight`
function, an inivisible `title` with formatted deviation and color fill based on
part number. 

Finally, a printed line with label and ideal population, total population divided
by number of parts, is also printed in the svg. 

## Helper Functions

- Function `barLength(d, maxValue)` takes a datapoint's proportion of its
`maxValue` and scales it to global constant `width`. 
- The max display value is not necessarily the max data value. According to function
`maxDisplayValue(population)` may be the max data value or twice the ideal population
value. 
- The following global consts are defined as display parameters
   - `defaultHeight`, standard height of the chart
   - `width`, standard width of the chart
   - `gap`, the standard gap between two bars
   - `extra`, a padding value for labels.

# # 

### Suggestions

- A reminder that `state.population` is not initialized in the initial creation
of the `state` object.
- Another reminder that svg can be modified by css, if global formatting is needed.
- Consts, hard-coded display settings, are defined as global variables, which could
live in utils as an object.
