# Place Exceptions

Due to the rapid development of districtr, the codebase is
riddled with conditions that are hard coded based on `place`. Ideally,
these conditions should be encapsulated in `spatial_abilities`. 

## Exceptions in the Map and its Layers

The purpose of `addLayers(...)` is to add `Layer`s to the
mapbox-gl `map`. 

- If the `borderId`, essentially `place`, is in Arizona, i.e.,
`yuma`, `nwaz`, `seaz`, `maricopa` and `phoenix`, a layer of
Block Group is added.
- If the `borderId` is `sacramento`, then a layer of Tracts
are added. 

In `edit.js`, an extra function `getMapStyle(...)` is passed
when creating the `MapState`. District maps are plotted in map style
`light-v10` and community maps are plotted with `streets-v11`, 
but...

- Places in Arizona, `yuma`, `nwaz`, `seaz`, `maricopa` and,
`phoenix` are plotted like community maps with `streets-v11.`

- Since Louisiana calls its county units Parishes and Alaska calls
many of its county units Boroughs (versus Census Areas), the Counties
Layer in `counties.js` considers `alt_counties` for places
`alaska`, `alaska_blocks` and `louisiana`. 
- A similar function occurs in the `Tools-Plugin` and the `BrushTool`. 

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
  
_could an extra layers spatial_ability be added?_
_could a map style spatial_ability be added?_
_altcounties by state rather than place_


## Exceptions Among the Plugins

- Household Income tables and associated overlays are included
if available but not if they're places in Arizona, e.g. 
`yuma`, `nwaz`, `seaz`, `maricopa`.

- The Contiguity Section is displayed when plotting districts
and if permitted by `spatial_abilities`, but not if they're
`ma_towns`. 
- In the Population Balance Plugin and NumberMarkers, places with
units of source `ma_precincts_02_10`, `ma_towns` and sometimes 
`indiana_precincts` supercede any `place.id` when interacting with 
PythonAnywhere functions. 
- The same is true for Contiguity and VRAEffectiveness, but placeID
is not used anywhere for any place as the PythonAnywhere interface
was rewritten later
- A custom warning is shown in `ContiguitySection` for Ohio and 
Wisconsin

## Exceptions in Netlify Lambdas and the Server

Certain states "are not included in PostGIS, according to planContiguity.js".
Thus, in `planContiguity.js`, these exceptions are for...
- states AK, CO, GA, HI, IA, MA, MD, MI, MN, MS, NC, NM, OH, OK,
OR, PA, RI, TX, UT, VA, VT and WI
- places Chicago, `ma_02` towns, and Providence, RI. 

Any time PythonAnywhere is queried or CSV plans are saved or retrieved,
an exception must be made from the default separator `,` when working with 
Louisiana data. This might be due to the fact that precinct names include 
commas. Thus, separator `;` is used instead. This occurs with...
- `NumberMarkers`
- `VRAEffectiveness`
- `Tools-Plugin`
- `PopulationBalancePlugin`
- `Contiguity`
- and `routes.js`.

