# The Story of [Districtr]

<img src="../assets/new_logo.jpg" width=50%>

In the name of Democracy, "Districtr is a free, public web tool for
districting and community identification, brought to you by the
[MGGG Redistricting Lab]." Districtr allows citizens to draw maps and
calculate demographics to help with the drawing of districts large and
small.

This app was born on Sat. Aug. 18, 2018. What began with [@maxhully]'s
Sept. 2018 [Mapbox] experiments has bloomed into a vital app that many
citizens and state redistricting comissions rely on for governing the
district boundaries that in turn, govern us. Over time, many creative
minds in Mathematics, Computer Science, Geography and Politics have
converged to promote transparent and good governance as a new decade is
born. 

As of June, 2021, Districtr is managed by MGGG, a research group at the
Tisch College of Civic Life, at Tufts University near Boston, Mass., led
by Principal Investigator, Moon Duchin, Associate Professor of
Mathematics and her dedicated [team].

<img src="./pics/timeline.png" width=75%>

## 1. The Districtr JSON context/plan model
Distirctr keeps track of a specific problem or assignment of a certain
region, its districts and units used in a model described in the
following model.

- [The Plan/Model JSON](./1contextplan/plancontext.md)
- [The State Object](./1contextplan/state.md)

## 2. Initializing: the Editor and its Map

<img src="./pics/initializesimple.png" width=75%>

- [How is the Districtr Editor page loaded?](./2editormap/initialization.md)
- [edit.js and the Editor Object](./2editormap/editor.md)
- [The Map Object](./2editormap/map.md)
- [Adding Layers](./2editormap/layer.md)
- [Number Markers](./2editormap/numbermarkers.md)


## 3. User Interace: Tools and Plugins 

<img src="./pics/toolbarbasics.png" width=50%>

[Making space for the Toolbar](./3toolsplugins/toolbar.md)

[The Tools-Plugin prevails](./3toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./3toolsplugins/tool.md)
  - [Brush and Erase Tools](./3toolsplugins/BrushEraseTools.md)
  - [Inspect Tool](./3toolsplugins/inspecttool.md)

[Popups a la Modal](./3toolsplugins/modal.md)

[The top-bar Menu](./3toolsplugins/topmenu.md)

[Rendering in Action: OptionsContainer](./3toolsplugins/optionscontainer.md)

[UIStateStore](./3toolsplugins/uistatestore.md)

[Actions and Reducers](./3toolsplugins/actionsreducers.md)

[A List of UI and Display Components](./3toolsplugins/uicomponents.md)

[Tabs and Reveal Sections](./3toolsplugins/sections.md)

## 4. User Interaction: Drawing Districts

<img src="./pics/drawingbasics.png" width=50%>

[Hovering over the Map](./4drawing/brush.md)

[Painting and Erasing with Brush and Community Brush](./4drawing/mapbrush.md)

[Undo and Redo](./4drawing/undoredo.md)

[The Tooltip Brush](./4drawing/tooltip.md)

[Checking for Contiguity](./4drawing/contiguity.md)

## 5. Interesting Communities and Landmarks

  - [Communities of Interests in Use](./5landmarks/coi.md)
  - [The Landmark Class](./5landmarks/landmarkclass.md)
  - [Landmark Tool](./5landmarks/landmarktool.md)
  - [The Community Plugin]((./5landmarks/communityplugin.md)
  - [The Multi Layers Plugin](./5landmarks/multilayersplugin.md)
  - [The Data Layers Plugin](./5landmarks/datalayersplugin.md)
  
Layer Overlay 

## 6. Charts and Analysis

[Population Balance Plugin](./6charts/popbalanceplugin.md)
- [Population Bar Chart](./6charts/populationbarchart.md)

[Election Results](./6charts/electionresults.md)

[DataTable](./6charts/datatable.md)
  - Demographics
  - Racial Balance Table
[Pivot Table](./6charts/pivottable.md)
  - Coalition Pivot Table

Highlight Unassigned

datasetInfo 

## 7. Districtr-default State Portals

<img src="./pics/portalsbasics.png" width=75%>

Index.html

[Districtr State Portals](./7portals/districtrstateportals.md)

[PlaceMap]

[Parameter](./7portals/parameter.md)

[Select](./7portals/select.md)

## 8. Routes and Server Operations

[Routes](./8routes/routes.md)

[Intro to districtr-eda]](./8routes/districtreda.md)

netlift lambda?

## 10. Deployment and Navigation

package.json

`_headers`

`_redirects`

npm, netlify, 

## 11. Spatial Abilities and Exceptions

Spatial Abilities in Utils

## 12. Events and Tags

src/views/event.js, Toolbar.js, modal, state landing page

## 13. Grand Suggestions

<a name="team"></a>

## 14. The Team

## 15. Colophon
This documentation covers the state of districtr on [Tues., June 1, 2021]. 
Further changes will be noted periodically.

[Tues., June 1, 2021]: https://github.com/districtr/districtr/commit/6da65021cdbcf76022c0d8603e67111a3455b25f

[@maxhully]: http://github.com/maxhully
[Mapbox]: https://docs.mapbox.com/mapbox-gl-js/api/
[districtr]: http://districtr.org
[MGGG Redistricting Lab]: http://https://mggg.org/
[team]: #team
