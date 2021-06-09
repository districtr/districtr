# Printing Dataset Information 

Within the [Population Balance Plugin], a section of class `.dataset-info` is created,
which is populated by the `populateDatasetInfo(editor)` function found in
`src/components/Charts/DatasetInfo.js`. This allows the user to see precisely where
we sourced our information. This is a relatively new feature, first written by
[@apizzimenti] on Tues., Mar. 16, 2021, who maintains it together with [@AtlasCommaJ]
and [@mapmeld].

This function retrieves all elements of class `.dataset-info` using an AngularJS
directive-promise scheme. Helper function `datasetInfo(state)` hard codes the text
related to `state.population` and `state.place` as follows. 

- By default, much of our data comes from the census and we say that it
"Uses __2010 Decennial Census__ data." 

- If special cases "wisco2019acs", "grand_county_2", "mn2020acs", or the
units include "2019" or any case where the population name does not contain "Population"
(like rental and age data), we say that it "Uses __2019 American Community Survey__ data.

- Additionally, in "mesa" or "pasorobles", we furhter indicate that our population is
"disaggregated from blockgroups by Redistricting Partners" and "Cooperative Strategies"
respectively. 

# #

### Suggestions

- Is there a way we can handle these special cases and special language in `spatial_abiliies`?
- Directives come from AngularJS, whereas we use lit-html throughout Districtr for templating.
Can't we just use lit-html to populate this text?

[Population Balance Plugin]: ./6charts/popbalanceplugin.md
