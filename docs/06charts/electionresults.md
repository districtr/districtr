# Two Ways to Explore Election Results

When a user paints districts, a user can use past election results to help
inform their selections. There are two ways that election data is reported
in default districr: through the `evaluation-section` tab and `data-layers`
or `multi-layers` plugin tab.

## Election Results Overlay 

When [`data-layers-plugin`] loads, a `PartisanOverlayContainer` is created
an rendered in the Data Layers Tab under a section titled "Statewide Elections."

> The `PartisanOverlayContainer`/`Election` pattern is also used when two-way
proportions are used, like the renter vs. owner demographic overlay layer. 

### `districtr/src/layers/PartisanOverlayContainer.js`

The `PartisanOverlayContainer` is responsible for rendering...
- a list of available elections for display
- the statewide candidate proportions for the selected election
- The option to display or hide the election map layer
- A legend for party shading
- The option to display the results as tints or circles.

The list of available elections is stored in `state.elections` passed
in from `data-layers-plugin`. A `PartisanOverlay` is created with
each election which in practice extends `Overlay`, which creates a
series of `Layer`s, which does the work of rendering themselves in the
`map`.

To choose the relevant `this._currentElectionIndex`, a `Parameter`is created
labelled "Election:". Its `element` is a `Select` list of available elections
whose callback is both `this.setElection` and the rerendering of a `DataTable`
that updates the well-formatted overall election table located in element
id `#election-vote-share`. 

A hard coded `toolbar-checkbox` triggers `this.toggleVisibility(...)` among
other events that instructs `this.currentElectionOverlay` to show or hide
itself. 

This object also has a `this.candidateLegend()` function that renders colors
for the various election participants, optional election options related to
in-person or absentee ballots if permitted by the properties of each `election`
and a `Select` list that allows a user to display a tint or colored circle
representation on the main `map`. 

## Evaluation Election Details
Sepearate from the displaying election results on the map, one can evaluate
the performance of their drawn districts based on historical results.

> One can display overlays for and evaluate districts upon two completely
different elections. They're independent of one another. 

The "Election Details" section is rendered by the `ElectionResultsSection`
reveal section in the evaluation tab rendered by the `EvaluationPlugin` if  
there are any `states.elections` to show. Together with special caveats for
absentee election options and reveal section options for display, an
`ElectionResultsSection(...)` is placed in this area. 

### `src/components/Charts/ElectionResultsSection.js` and `ElectionResults`

The `ElectionResultsSection` is a simple lit-html which contains a single 
`Select` dropdown of available elections which allows the user to pick the
election used in `ElectionResults` when evaluating each district. Within
`src/components/Charts/ElectionResults.js`, `ElectionResults(election,parts)`
is a function whose responsibility is it is to render two seperate `DataTable`s.

The overall table contains information on total "Vote Share" and "Seat Share"
whereas a second "By District" table is rendered which takes each `state.activeParts`,
renders their icon and reports a summation of election results over each unit
in a drawn district. 

There are also helper functions in `ElectionResults` that help format each
cell and renders their tinted background. 

## The `Election` Model 

We are able to navigate election model for easy display thanks to the `Election` model
found in `/src/models/Election.js`. This object extends the `ColumnSet` and requires
the following parameters...
- `name`, the name of the Election
- `subgroups`, different parties
- `parts`, as in user-drawn distrits
- `alternate`, alternative data usually related to how the user wishes to count
absentee ballots.

With these parameters, instance variables, getters and setters are also created.
- `super` is created with a sorted list of subgroups, `type` "election" and passed in parts from
which...
  - `this.subgroups` is created, ultimately the result of `this.parties()` and `this.columns()` 
- `this.name`
- Bound function `this.getOtherParty(party)` which works in a two-party setting
- Bound function `this.marginAsMapboxExpression(party)` for use when rendering data in mapbox
- and finally `this.getSeatsWon(party)` which calculate the proportion of integer number of
seats to help with determining proportionality. 

[`data-layers-plugin`](5landmarks/datalayersplugin.md)

# # 

### Suggestions

In `PartisanOverlayContainer`, a checkbox element is hard coded. Could
we use the `Toggle` object instead?