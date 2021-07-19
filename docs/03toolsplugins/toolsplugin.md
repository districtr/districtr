 # Tools-Plugin, the King of Plugins

As described in [`Toolbar`], different problems require a different
sets of tools which must be loaded into the `Toolbar` section of the
[`Editor`]. The `edit.js` view provides a list of plugins to the
`Editor` which are then created depending on whether the editor
 is being used to paint districts or identify communities of interest.
 
The first plugins were written by [@maxhully] on Tues., Apr. 23, 2019.

<img src="../pics/toolbarbasics.png" width=50%>

## Loading Plugins

Specifications on which plugins to include are defined by 
`src/views/edit.js` and are handed to the `Editor` object. On
construction, the `Editor` object calls each plugin function, which
requires a reference to the Editor object.

# [src/plugins/tools-plugin.js]

The basic slate of tool plugins is loaded by `tools-plugin.js`, no
matter whether we're painting districts or identifying communities of
interest.  Created with the first batch of plugins in the Spring of
2019, this file is actively maintained and expanded by [Jamie], [Nick],
[Jack], [Anthony] and [JN].

## The tools-plugin function
Tools-plugin is responsible for rendering certain tools in the `Toolbar`
navigation [menu], creating [Brushes], handling [contiguity checks] and
[district numbers] and some [`community`] and [`vra`] mode
functionality. This file also happens to defines a list of `Menu`
functions for the `Toolbar`. 

### Important Imports

The tools-plugin handles the important job of coordinating tools that
Brush and Erase with the [`Map`] cavnas and the data/info `Toolbar`.
Thus, nearly all tools must be imported here.
- Tools like the [`BrushTool`], [`EraserTool`], [`InspectTool`],
[`PanTool`], and [`LandMarkTool`] 
- Map Brushes like the [`Brush`], [`CommunityBrush`] and
[`HoverWithRadius`]
- Additional Map layers like [`NumberMarkers`]
- Advanced Map functions like [`ContiguityChecker`] and
[`VRAEffectiveness`]
- User display [modals]
- Server functions from [`routes`]
- Utilities and settings like [`spatial_abilities`]

### Rendering Tools

Users encounter the full functionality of districtr tools in the
`Toolbar`, known to this function as `editor.toolbar` or simply
`toolbar`. This basic set of tools, imported from elsewhere, are then
instantiated by the `ToolsPlugin` and are stored in a list. Those
`Tools` are as follows...

- `PanTool()`, for simple map panning
- `BrushTool(brush, state.parts, brushOptions)`, which colors the map
with a given set of plan districts and options.
- `EraserTool(brush)`, which erases assignment made by the Brush Tool.
- `InspectTool(state.units...`), which allows users to view tabular, 
unit by unit information. 

Each tool is added by the `toolbar`to itself and from then on, it is the
`toolbar`'s responsibiity to manage the selection of each tool by the
user. Each tool also has an associated hotkey, and the `toolbar` is also
loaded with `Menu Options` depending on the State.

### Brushes

Many tools above require an instance of a brush, so before these tools
can be rendered, a `brush` instance must be created. There's two kinds, 
a `CommunityBrush` and a regular `Brush`, which require the
`state.units` and a default radius. The following brush behaviors are
also tied together...
- On "colorfeature", we call back `state.update`
- On "colorend", we call back `state.render` and `toolbar.unsave`

Brush options are also set, informing the brush if the problem type is
a `community`, whether `spatial_abilities` permits us to paint with
counties (applying `HoverWithRadius(...)` functionality) and the special
case in Louisiana where our counties are known as parishes.

Finally, if `community` is selected, we create a new
[`LandmarkTool(state)`].

### Additional Functionality

New functions are implemented when they are tied to the brush's on
`"colorop"` callbacks.
- First, we always `savePlanToStorage()`.
- For district numbers display on a screen, we create `NumberMarkers`,
saved directly to the window, and toggle their operations to checkbox id 
`toggle-district-numbers`. 
- If `spatial_abilities` permits contiguity check, a `ContiguityChecker`
is created which specifies knowledge of the current UI`state` and 
`colorsAffected` by the discontinuity such that a list is diplayed in
the toolbar. 
- If we're in [vra] mode, the `VRAEffetiveness(state, colorsAffected)`
function is loaded. 

### Other Functions

This `tools-plugin` also contain other helper functions which are used
in Menu Options.

- `exportPlanAsJSON(state)` serializes the current plan into text and
directs the browser to download this as a .json file
- `exportPlanAsSHP(state, geojson)` serializes the current plan, alerts
the user in a model, and relies on a `routes` server function to provide
a zipped SHPfile package.
- `exportPlanAsAssignmentFile(state, delimiter = ",", extension = "csv")`
and `exportPlanAsBlockAssignment(...)` are similar functions that
provide csv files.
- `scrollToSection(state, section)` navigates back to the state portal
- `getMenuItems(state)` returns a lists of these functions and more for
display in the menu section of the browser.

# #

### Suggestions

- The logic for selecting which tools to plug in, based on
`state.problem`, `spatial_abilities` and more, are scattered throughout
the code. Is there a way to consolidate this logic?
  - In `view/edit.js`, before the `State` is created,
`context.problem.type` determines the list of plugins to load. No matter
the logic, `tools-plugin` is always loaded, while other plugins are
swapped in and out.
  - Within ` tools-plugin`, different kinds of `Brush` are created
whether the `state.problem.type` is community or not. 
  - If `state.problem.type` is communtiy, the `LandmarkTool` is created.
  - `state.problem.type` is passed in as a `brushOption` even if the
Brush is already of `CommunityBrush` or regular `Brush` type.
  - Contiguity Check and VRA does not apply in `community` mode
  - Menu words are chosen on `community` type
  For VRA
   - The `VRAEffectiveness` module
   is loaded if `vra` mode is applied. 
- `Menu` and its functions does so much, it should have its own
dedicated file. It only relies on problem/context `State` to provide a
list of menu options.

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

- Here: [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully
[Jamie]: http://github.com/AtlasCommaJ
[Nick]: http://github.com/mapmeld
[Jack]: http://github.com/jdeschler
[Anthony]: http://github.com/apizzimenti 
[JN]: http://github.com/jenni-niels

[`Editor`]: ../02editormap/editor.md
[`Map`]: ../02editormap/map.md
[`NumberMarkers`]: ../02editormap/numbermarkers.md
[district numbers]: ../02editormap/numbermarkers.md

[menu]: ../03toolsplugins/topmenu.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[`EraserTool`]: ../03toolsplugins/brusherasetools.md
[`InspectTool`]: ../03toolsplugins/inspecttool.md
[`PanTool`]: ../03toolsplugins/tool.md
[modals]: ../03toolsplugins/modal.md

[Brushes]: ../04drawing/brush.md
[`Brush`]: ../04drawing/brush.md 
[`CommunityBrush`]: ../04drawing/brush.md
[`HoverWithRadius`]: ../04drawing/hover.md
[`ContiguityChecker`]: ../04drawing/contiguity.md
[contiguity checks]: ../04drawing/contiguity.md

[`community`]: ../05landmarks/coi.md
[community]: ../05landmarks/coi.md
[`LandMarkTool`]: ../05landmarks/landmarktool.md
[`LandmarkTool(state)`]: ../05landmarks/landmarktool.md

[vra]: ../06charts/vra.md
[`vra`]: ../06charts/vra.md
[`VRAEffectiveness`]: ../06charts/vra.md

[`routes`]: ../09deployment/routes.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md

[src/plugins/tools-plugin.js]: ../../src/plugins/tools-plugin.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA