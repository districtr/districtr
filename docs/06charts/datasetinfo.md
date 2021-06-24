# Printing Dataset Information 

Within the [Population Balance Plugin], a section of class
`.dataset-info` is created, which is populated by the
`populateDatasetInfo(editor)` function found in 
[`src/components/Charts/DatasetInfo.js`]. This allows the user to see
precisely where we sourced our information. This is a relatively new
feature, first written by [@apizzimenti] on Tues., Mar. 16, 2021, and
is currently maintained by [@mapmeld] together with [@AtlasCommaJ].

This function retrieves all elements of class `.dataset-info` using an
AngularJS directive-promise scheme that sources information based on the
`State` object. Helper function `datasetInfo(state)` hard codes the text
related to `state.population` and `state.place` as follows. 

- By default, much of our data comes from the census and we say that it
"Uses __2010 Decennial Census__ data." 

- If special cases "wisco2019acs", "grand_county_2", "mn2020acs", or the
units include "2019" or any case where the population name does not
contain "Population" (like rental and age data), we say that it "Uses
__2019 American Community Survey__ data.

- Additionally, in "mesa" or "pasorobles", we furhter indicate that our
population is "disaggregated from blockgroups by Redistricting Partners"
and "Cooperative Strategies" respectively. 

# #

### Suggestions

- Is there a way we can handle these special cases and special language
in `spatial_abiliies`?
- Directives come from AngularJS, whereas we use lit-html throughout
Districtr for templating. Can't we just use lit-html to populate this
text?

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
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- Previous: [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- Next: [A Full Example: VRA](../06charts/vra.md)

[Population Balance Plugin]: ./6charts/popbalanceplugin.md
[`src/components/Charts/DatasetInfo.js`]: ../../src/components/Charts/DatasetInfo.js
[`State`]: ../01contextplan/state.md

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@jenni-niels]: http://github.com/jenni-niels
[@apizzimenti]: http://github.com/apizzimenti

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA