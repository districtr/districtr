# Plugins

<img src="../pics/plugins.png" width=50%>

Plugins is the main way we organize features around given different
places and contexts. Plugins are functions that...

- Create [Tabs and Sections] in the [Toolbar]
- Populate Charts and Tables
- Loads Containers, Toggles and user options. 

## Loading

The responsibility for checking a [context/plan]'s problem and loading
the appropriate plugin rests with edit.js when it is called on
initialization. Currently, this list is being sent to Editor which calls
each function for creating, sending itself as an argument.

The default list of plugins for painting districts is...
- [ToolsPlugin]
- [PopulationBalancePlugin]
- [DataLayersPlugin]
- and [EvaluationPlugin]

When identifying communities of interests and landmarks, we load...
- [ToolsPlugin]
- [DataLayersPlugin]
- [CommunityPlugin]

An experimental mode, known as "coi2" only applies for a few modules in
North Carolina. This loads... 
- [ToolsPlugin]
- MultiLayersPlugin
- [CommunityPlugin]

## [The Tools Plugin]

The Tools Plugin is always called. The Tools Plugin loads both the tools
the user sees in the Toolbar and their associated brushes used in
editing the map. It also loads universal abilities like [NumberMarkers],
[ContiguityChecker], other [menus] and [modals] and the ability to save
and download plans using [`routes.js`]

## [The Data Layers Plugin]

The Data Layers Plugin is also called in nearly all occasions. It is
responsible for loading the tabs and the user interface required to
load different overlays, election returns and demographic data users
can use to paint districts and identify communities. It considers the
many different combination of layers appropriate for each layer.

## [The Population Balance Plugin]

The Population Balance plugin is only in use when drawing districts.
Its big responsibility is to keep a running total of the population of
each district to assist users in drawing balanced districts. 

## [The Evaluation Plugin]

The Evaluation Plugin generates similar charts to the one in Population
Balance Plugin but with more detail. It creates charts on a variety of
variables like demographics, race and partisanship. They are updated as
the user edits their district plans. They can also toggle for
[Contiguity] thanks to this plugin.

## [The Community Plugin]
The Community Plugin replaces the Population Balance plugin when we draw
[communities of interest] instead of districts. It allows users to paint
parts now known as communities as well as mark and edit [Landmarks].

## The Multilayers Plugin
The Multilayers plugin is an experimental feature one can visit when
they [draw communities of interest for North Carolina]. It replaces the
Data Layers Plugin with more robust details and wider datasets one can
display on the map. 

# # 

[Return to Main](../README.md)

- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)
- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)
- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)
- Here: [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[context/plan]: ../01contextplan/plancontext.md

[Toolbar]: ../03toolsplugins/toolbar.md
[ToolsPlugin]: ../03toolsplugins/toolsplugin.md
[The Tools Plugin]: ../03toolsplugins/toolsplugin.md

[PopulationBalancePlugin]: ../06charts/popbalanceplugin.md
[The Population Balance Plugin]: ../06charts/popbalanceplugin.md

[DataLayersPlugin]: ../06charts/datalayersplugin.md
[The Data Layers Plugin]: ../06charts/datalayersplugin.md

[CommunityPlugin]: ../05landmarks/communityplugin.md
[The Community Plugin]: ../05landmarks/communityplugin.md

[EvaluationPlugin]: ../06charts/evaluationplugin.md
[The Evaluation Plugin]: ../06charts/evaluationplugin.md

[MultiLayersPlugin]: ../06charts/multilayersplugin.md

[draw communities of interest for North Carolina]: https://districtr.org/north-carolina?mode=coi

[NumberMarkers]: ../02editormap/numbermarkers.md

[menus]: ../03toolsplugins/topmenu.md
[modals]: ../03toolsplugins/modal.md
[Tabs and Sections]: ../03toolsplugins/uicomponents.md
[Toolbar]: ../03toolsplugins/toolbar.md

[ContiguityChecker]: ../04drawing/contiguity.md
[Contiguity]: ../04drawing/contiguity.md

[Landmarks]: ../05landmarks/landmarksclass.md
[communities of interest]: ../05landmarks/coi.md

[`routes.js`]: ../09deployment/routes.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA