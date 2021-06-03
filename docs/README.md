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

- [The Plan/Model JSON](./plancontext.md)
- [The State Object](./state.md)

## 2. Initializing: the Editor and its Map

<img src="./pics/initializesimple.png" width=75%>

- [How is the Districtr Editor page loaded?](./initialization.md)
- [edit.js and the Editor Object](./editor.md)
- [The Map Object](./map.md)
- [Adding Layers](./layer.md)
- [Number Markers](./numbermarkers.md)


## 3. User Interace: Tools and Plugins 

<img src="./pics/toolbarbasics.png" width=50%>

[Making space for the Toolbar](./toolbar.md)

[The Tools-Plugin prevails](./toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./tool.md)
  - [Brush and Erase Tools](./BrushEraseTools.md)
  - [Inspect Tool](./inspecttool.md)

[Popups a la Modal](./modal.md)

[The top-bar Menu](./topmenu.md)

[Rendering in Action: OptionsContainer](./optionscontainer.md)

[UIStateStore](./uistatestore.md)

[Actions and Reducers](./actionsreducers.md)

[A List of UI and Display Components](./uicomponents.md)

## 4. User Interaction: Drawing Districts

<img src="./pics/drawingbasics.png" width=50%>

[Hovering over the Map](./brush.md)

[Painting and Erasing with Brush and Community Brush](./mapbrush.md)

[Undo and Redo](./undoredo.md)

Inspect Tool and ToolTips

Checking for Contiguity

## 5. Interesting Communities and Landmarks

  - Landmark Tool
  - Landmark Class
  - community-plugin.js

## 6. Charts and Analysis

Tabs and more here!

Chart js functions


## 7. Districtr-default State Portals

<img src="./pics/portalsbasics.png" width=75%>

Index.html

[Districtr State Portals](./districtrstateportals.md)

PlaceMap


## 8. Routes and Server Operations

## 10. Deployment and Navigation

## 11. Spatial Abilities and Exceptions

## 12. Events and Tags

## 13. Grand Suggestions

<a name="team"></a>

## 14. The Team

## 15. Colophon
This documentation covers the state of districtr on [Tues., June 1, 2021]. 
Further changes will be noted periodically.

[Tues., June 1, 2021](https://github.com/districtr/districtr/commit/6da65021cdbcf76022c0d8603e67111a3455b25f)


[@maxhully]: http://github.com/maxhully
[Mapbox]: https://docs.mapbox.com/mapbox-gl-js/api/
[districtr]: http://districtr.org
[MGGG Redistricting Lab]: http://https://mggg.org/
[team]: #team
