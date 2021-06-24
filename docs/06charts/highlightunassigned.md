# Highliting Unassigned Units

A simpler version of the [Contiguity] functionality of districtr is the
`HighlightUnassigned` capability offered by the [`pop-balance-plugin`].
It is another good example of how plugins can depict information in the
[`map`] canvas and is embodied in three relatively simple pieces of
code. 

## [`src/components/Charts/HighlightUnassigned.js`]

This file contains only the default lit-html render function
`HighlightUnassigned`, which takes `unitsBorders` and a `zoomFunction`
as parameters. When implmented  by the `pop-balance-plugin`, it takes
`state.unitsBorders`, from the `State` object, and a `zoomToUnassigned`
function, defined by the plugin, which we describe below.

To render, `HighlightUnassigned` creates a div of id
`#unassigned-checker` with two elements. A `toggle` titled "Highlight
unassigned unit" unchecks any boxes checked by the contiguity toggles,
sets the paint properties of `unitsBorders`, an object tied to a `map`
[`layer`] that draws district boundaries (as opposed to tinting or
coloring them).

`highlightUnassignedUnitBordersPaintProperty` in `colors` command that
the layer color unassigned unit boundaries are plotted a different color
than painted ones. This is done by sending the `mapbbox` layer a case,
`["==", ["feature-state", "color"], null]` that filters for
features/units of color `null`. 

Finally, a button is revealed allowing the user to "Zoom to unassigned".

## The `zoomToUnassigned` function

When permittted by [`spatial_abilities`] to `find_unpainted`, a special
function talks to the server to trigger the `/unassigned` function,
similiar to other [`routes`]. The current `state`, including current
assignments, is serialized and posted to the server to collect
information on `unassigned` units. This data is then sent back to the
server to `/findBBox` which is then parsed. `Editor.state.map` is then
told to fit within those bounds.

## [`/src/components/Charts/UnassignedPopulation.js`]

Finally, we can see the number of assigned and unassigned population in
the `pop-balance-plugin` thanks to the default in function
`UnassignedPopulation` which compares the sum
`state.population.total.data` with `state.population.total.sum` and
prints the value as an "Unassigned population".

# #

### Suggestions

- The `PopBalancePlugin` creates a function, `zoomToUnassigned` that is
always used with `HighlightUnassigned`. Thus, it makes more sense to
have that function written in that file. 

- `zoomToUnassigned` is one of only a few functions outside of
`routes.js` that talks to the PythonAnywhere. For clarity sake, these
calls should be collected in one file. 

- Finally, that function makes references to the mapbox-gl map, which
can alternatively be called from `edtior.state.map`,
`editor.mapState.map` and is probably even `editor.map`. For clarity,
there should be one way to reach this map, which suggests that global
variables might be useful.

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
- Next: [Dataset Info](../06charts/datasetinfo.md)
- [A Full Example: VRA](../06charts/vra.md)

[`map`]: ../02editormap/map.md
[`layer`]: ../02editormap/layer.md

[routes]: ../09deployment/routes.md

[`pop-balance-plugin`]: ../06charts/popbalanceplugin.md

[Contiguity]: ../04drawing/contiguity.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

[`/src/components/Charts/UnassignedPopulation.js`]: ../../src/components/Charts/UnassignedPopulation.js
[`src/components/Charts/HighlightUnassigned.js`]: ../../src/components/Charts/HighlightUnassigned.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA