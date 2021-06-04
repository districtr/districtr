# Population Bar Chart

/src/components/Charts/PopulationBarChart.js 

Used in src/plugins/pop-balance-plugin.js

[@maxhully] Jan 11, 2019

Implements section of class `.toolbar-section` with `horizontalBarChart(...)`

## horizontalBarChart(population, parts)

Not to be confused with 
HorizontalBarChart.js used 
in tooltips!

population parameter has
comes from `state.population`

> not initalized in state!

Returns class`bar chart` where for each
data entry in `data`, a rectangle is created
with non-displayed title and deviation, 
if non-zero, a number with commas

And a printed line with ideal population. 

## Helper Functions

Barlength
MaxDisplayValue
const extra=20

_svg can be modified by css_