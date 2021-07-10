# VRA

Since early 2021, [@jenni-niels] has been developing a corner of the
website concerning Voting Rights Act information in the states of
Louisiana, Texas and Massachusetts. Their work is a good example of how
new features are currently built across the sprawling codebase of
Districtr. 

## Portal

VRA has its own landing page, [`districtr.org/vra`], which loads
`vra.html`. This file is nearly identical to other state html pages
except for its head `id`, which helps [`stateLandingPage.js`] render the
VRA Dashboard properly.

### `StateLandingPage.js`

When the State Landing Page renderer loads, it nearly immediately
checks `head.id` to see if `vraPage` is true. This boolean governs
the alternative behavior of this page.

First, just as the other states do, `VRA - Dashboard` has its own
entry in `/assets/data/landing_pages.json`. Since VRA is unique among
other landing pages in that takes modules from different states
rather than one, it must collect state places differently, reflected
in the lines that create consts `vraFutures` and `statePlaces`. From
here, it proceeds to render the sections in `landing_pages.json`
as usual.

Note, the different sections change their information based on the
state seleted. This is done because there are other decision points
throughout the text that hinge upon the value of `vraPage`.

- In `drawPage(...)`, vra, like onlyCommunities, skips a 
place options list
- In the default function, the rendering of `communityOptions(...)`
is skipped
- Custom function `toggleViz` seelcts the showing and hiding of
different state sections, and is only called when `vraPage` is true

## The Map, Editor and Toolbar

Rather than sourcing vra status from the window url, [`edit.js`] now
sources this information from [`spatial_abilities`]. This is only
relevant in the rare case of `coi2` units, which affects [`map`]
padding, and the class name of the body, `.vra`. 

Next, the `Toolbar` is created and populated by the [`tools-plugin.js`]. 
Here, `showVRA` is set to `true` if the plan type is not community and
if it is allowed in `spatial_abilities`. This permits the creation
of `VRAEffectiveness(...)`. Helper function `getMenuItems(...)` also
generates a `showVRA`, but it is not used.

### VRA Effectiveness

Function VRAEffectiveness is called as part of a callback function
that `tools-plugin` attaches to [`brush`] that listens for a `colorop`
event, that is, when a unit is painted or erased from a district. This
is found in [`src/map/vra_effectiveness.js`].

Its main responsibility is to call an AWS function to check whether
Black and Hispanic Voters in Texas and Black voters in Louisiana
have effective opportunities to elect candidates of their choice.
This is done by initializing [`state`] variables `vra_effectiveness` and 
`waiting`, function variables `awaiting_response`, `cur_request_id`
and `newer_changes`, related to querying the AWS and providing a
function known as `vraupdater` that...

- Creates an assignment object based on the assignmnent plan
- If there is an assignment plan and there is no current pending
response...
  - refreshes the toolbar
  - Queries the AWS `/vra` function with a JSON object carrying
`assignment`, `state` and other information.
  - Parses the response, resets AWS variables, updates
`state.vra_effectiveness` and re-renders the `Toolbar`.
- If newer changes were made since the first request was made, then
`newer_changes` is made true and the original request is superceded with
a new call to `vraupdater(state)`.

## Updating Toolbar Functions

When the `Toolbar` is called to render by `VRAEffectiveness`, each
plugin is affected in large and small ways. When in VRA mode...

- in `DataLayersPlugin`, its title is abbreviated and the County Layer
is always plotted, 
- in `PopBalancePlugin`, its title is abbreviated

## The [`EvaluationPlugin`]

The most significant departure VRA introduces is in the Evaluation
Plugin. Like the other Tabs, its name is abbreviated but it is here that
fourth tab is made,  the `VRATab`.

The VRA tab adds two Reveal Sections which includes a
`VRAEffectivenessTable` and `VRAResultsSection`. Both use
`state.vra_effectiveness` which is updated by `vra_updater` desribed
above. 

`VRAEffectivenessTable` provides a [`DataTable`] based on the state's
VRA-relevant subgroups, together with a description.

The `VRAResultsSection` provides an even more detailed table, with a
select bar for each minority group, covering historical, statewide
primary and general elections, with vote, rank and CVAP share for each
painted district. 

## Other Areas

- When `la_vra` or `tx_vra` is the place for `NumberMarkers`, its data
source must be redirected
- In `modal.js`, a custom modal is written to provide information on
VRA. This is imported by `tools-plugin.js` but never used.

# #

### Suggestions

- In `StateLandingPage.js`, vra mode is unique in calling multiple
states. Places for each state are generated using 
`listPlacesForState(...)`, and in this function, `show_just_communities`
is set against its default to `true`. This suggests that we always use
the `communitiesFilter` in `PlacesList.js`. This filter, however, only
applies when `renderNewPlanView()`, in deprecated `community.js`, is
called. Thus, it is not needed. 

- In `tools-plugin.js`, `showVRA` is determined but not used by function
`getMenuItems(...)`
- In `VRAEffectiveness`, argument `brush` is not used and `placeID` and
therefore `place` and `extra_source` is not used.
- Names are abbreviated based on VRA. Could they be abbreviated by a
toolbar value,  number-of-tabs, to make this more universal?
- In `DataLayersPlugin`, `showVRA` is guaranteed to add a County Layer
to the map. However, VRA data is only available for states, making this
conidition redundant.
- The Reveal Section on "VRA Effectiveness" conditions against using
`ma_towns`,  yet there should be no case where `ma_towns` is used with
showVRA as it is not included in the portal. Mass. vra plans are made
with precincts. Thus, this is redundant logic.

- The biggest note is the fact that `EvaluationPlugin` is now
responsible for creating __two__ tabs. If `VRA` makes a second tab, it
should be made into its own plugin.

- A special modal is written for VRA but is never used 

# # 

[Return to Main](../README.md)
- Plugins for Data
  - [The Data Layers Plugin](../06charts/datalayersplugin.md)
  - [Population Balance Plugin](../06charts/popbalanceplugin.md)
  - [The Evaluation Plugin](../06charts/evaluationplugin.md)
- [The Population Model](../06charts/population.md)
- [Population Bar Chart](./06charts/populationbarchart.md)
- [Column-Sets and Parts](./06charts/columnsetsparts.md)
  - [Two ways to explore election results](../06charts/electionresults.md)
- [Data, Pivot and Coalition Pivot Tables](../06charts/datatable.md)
  - [Demographics, Racial Balance and Age Histogram Tables](../06charts/demographicstable.md)
  - [Histograms](../06charts/histogram.md)
- [Highlighting Unassigned Units: Three Simple Functions](../06charts/highlightunassigned.md)
- Previous: [Dataset Info](../06charts/datasetinfo.md)

[@jenni-niels]: http://github.com/jenni-niels

[`state`]: ../01contextplan/state.md

[`map`]: ../02editormap/map.md
[`edit.js`]: ../02editormap/editor.md
[`NumberMarkers`]: ../02editormap/numbermarkers.md

[`Toolbar`]: ../03toolsplugins/toolbar.md
[`tools-plugin.js`]: ../03toolsplugins/toolsplugin.md
[`EvaluationPlugin`]: ../06charts/evaluation.md

[`brush`]: ../04drawing/brush.md

[`DataTable`]: ../06charts/datatable.md
[`stateLandingPage.js`]: ../07pages/districtrstatepages.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

[`src/map/vra_effectiveness.js`]: ../../src/map/vra_effectiveness.js

[`districtr.org/vra`]: http://districtr.org/vra

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA