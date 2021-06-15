# Highliting Unassigned Units

A simpler version of the Contiguity functionality of districtr is the `HighlightUnassigned`
capability offered by the `pop-balance-plugin`. It is another good example of how
plugins can depict information in the `map` canvas and is embodied in three relatively 
simple pieces of code. 

## `src/components/Charts/HighlightUnassigned.js`

This file contains only the default lit-html render function `HighlightUnassigned`,
which takes `unitsBorders` and a `zoomFunction` as parameters. When implmented 
by the `pop-balance-plugin`, it takes `state.unitsBorders` the `zoomToUnassigned`
defined by the plugin, which we describe below.

To render, `HighlightUnassigned` creates a div of id `#unassigned-checker` with
two elements. A `toggle` titled "Highlight unassigned unit" unchecks any boxes checked
by the contiguity toggles, sets the paint properties of `unitsBorders`, an object
tied to a `map` layer that draws district boundaries (as opposed to tinting or coloring
them).

`highlightUnassignedUnitBordersPaintProperty` in `colors` command that the layer color
unassigned unit boundaries a different color than painted ones. This is done by sending
the `mapbbox` layer a case, `["==", ["feature-state", "color"], null]` that filters
for features/units of color `null`. 

Finally, a button is revealed allowing the user to "Zoom to unassigned".

_The zoom-to-unassinged function can be placed in this file instead._

## The `zoomToUnassigned` function

When permittted by `spatial_abilities` to `find_unpainted`, a special function talks
to the server to trigger the `/unassigned` function, similiar to other `routes`.
The current `state`, including current assignments, is serialized and posted to 
the server to collect information on `unassigned` units. This data is then sent back
to the server to `/findBBox` which is then parsed. `Editor.state.map` is then told
to fit within those bounds.

_those that talk to server should be in one place_

_editor.state.map is the same is as editor.mapState.map and maybe even editor.map`


## `/src/components/Charts/UnassignedPopulation.js`

Finally, we can see the number of assigned and unassigned population in
the `pop-balance-plugin` thanks to the default in function `UnassignedPopulation`
which compares the sum `state.population.total.data` with `state.population.total.sum` 
and prints the value as an "Unassigned population".

_`State` should be a global variable!_
