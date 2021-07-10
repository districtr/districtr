# Place Exceptions

Due to the rapid development of districtr, the codebase is
riddled with conditions that are hard coded based on `place`. Ideally,
these conditions should be encapsulated in [`spatial_abilities`]. 

## Exceptions in the Map and its Layers

The purpose of `addLayers(...)` is to add [`Layer`]s to the
mapbox-gl [`map`]. 
- If the `borderId`, essentially `place`, is in Arizona, i.e., `yuma`,
`nwaz`, `seaz`, `maricopa` and `phoenix`, a layer of Block Group is
added.
- If the `borderId` is `sacramento`, then a layer of Tracts are added
and is used to display block groups as a background to blocks in the
editor. 

In [`edit.js`], an extra function `getMapStyle(...)` is passed when
creating the [`MapState`]. District maps are plotted in map style
`light-v10` and [community] maps are plotted with `streets-v11`, but...
- Places in Arizona, `yuma`, `nwaz`, `seaz`, `maricopa` and,
`phoenix` are plotted like community maps with `streets-v11.`

- Since Louisiana calls its county units Parishes and Alaska calls
many of its county units Boroughs (versus Census Areas), the Counties
Layer in `counties.js` considers `alt_counties` for places `alaska`,
`alaska_blocks` and `louisiana`. 
- A similar function occurs in the [`Tools-Plugin`] and the
[`BrushTool`]. 

## The Data Layers Plugin

The bulk of the `DataLayersPlugin` concerns itself with selecting
`Layer`s based on place. 

- "Show Boundary", from `/assets/city_border/`
  - Miami, Miami-Date County, FL
  - Rochester, Olmsted County, MN
  - Asheville, Buncome Bounty, NC
  - St. Louis, Duluth County, MN
- "Show Boundary", from `/assets/current_districts/`
  - Winston-Salem, Forsythe County, NC 
- "Voter Precincts", from `/assets/current_districts/`
  - Baltimore, MD
- "School Districts", from `/assets/current_districts/`
  - Akron, Cincinnati, Cleveleland, Toldeo, southeast and central Ohio
  - Indiana
  - Missiouri
  - New Hampshire
  - Wisonsin for all types
  - Michicagn 
- "Cities and Towns" from `/assets/current_districts/`
  - Indiana
  - Central Ohio 
- Enacted Plans from `assets/current_districts/`
  - State Assembly, State Senate and U.S. House for Los Angeles, CA
- "Boundaries" from `/assets/current_districts/`
  - El Paso, TX when base units aren't precincts.

## Exceptions Among the Plugins

- Household Income tables and associated overlays are included if
available but not if they're places in Arizona, e.g. `yuma`, `nwaz`,
`seaz`, `maricopa`.

- The [Contiguity Section] is displayed when plotting districts and if
permitted by `spatial_abilities`, but not if they're `ma_towns`. 
- In the Population Balance Plugin and NumberMarkers, places with
units of source `ma_precincts_02_10`, `ma_towns` and sometimes 
`indiana_precincts` supercede any `place.id` when interacting with 
[PythonAnywhere] functions. 
- The same is true for Contiguity and VRAEffectiveness, but placeID is
not used anywhere for any place as the PythonAnywhere interface was
rewritten later
- A custom warning is shown in `ContiguitySection` for Ohio and 
Wisconsin

Any time PythonAnywhere is queried or CSV plans are saved or retrieved,
an exception must be made from the default separator `,` when working
with  Louisiana data. This might be due to the fact that precinct names
include commas. Thus, separator `;` is used instead. This occurs with...
- [`NumberMarkers`]
- [`VRAEffectiveness`]
- [`Tools-Plugin`]
- [`PopulationBalancePlugin`]
- [`Contiguity`]
- and [`routes.js`].

# #

### Suggestions

Much of districtr's features and displays are dependent on the `place`
of the current module. As such...
- extra layers like "School Districts" can be stored as an object
- and map style, like `streets-v11`
... can be stored in `spatial_utilties`

Finally, `altcounties`, where Louisiana Parishes and Alaska Boroughs
serve as Counties, should be set by State rather than `place` because
`place` could refer to alternative datasets or local municipalities.

# # 

[Return to Main](../README.md)
- Previous: [Spatial Abilites](./10spatialabilities/spatialabilities.md)
- Next: [Utilities](./10spatialabilities/utils.md)

# #


[`Layer`]: ../02editormap/layer.md
[`map`]: ../02editormap/map.md
[`MapState`]: ../02editormap/map.md
[`edit.js`]: ../02editormap/editor.md
[`NumberMarkers`]: ../02editormap/numbermarkers.md

[`Tools-Plugin`]: ../03toolsplugins/toolsplugin.md
[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[`Tools-Plugin`]: ../03toolsplugins/toolsplugin.md

[Contiguity Section]: ../04drawing/contiguity.md
[`Contiguity`]: ../04drawing/contiguity.md

[community]: ../05landmarks/coi.md

[`DataLayersPlugin`]: ../06charts/datalayersplugin.md
[`VRAEffectiveness`]: ../06charts/vra.md
[`PopulationBalancePlugin`]: ../06charts/popbalanceplugin.md

[PythonAnywhere]: ../09deployment/districtreda.md
[`routes.js`]: ../09deployment/routes.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA



