# The Top-Bar Menu
Much of the top-bar Menu is contained within the [`Toolbar`] and
[`tools-plugin.js`] files. The Menu made its debut on Mon., Nov. 12,
2018 when [@maxhully] introduced export functionality.

## Opening and Closing

When a [`UIStateStore`] is created by the [`Editor`], the initial state
includes the default for `dropdownMenuOpen` variable, which is `false`.
The work of revealing and hiding the menu is performed by `Toolbar`,
when the `DropDownMenuButton` is rendered. This button makes dispatches
which ultimately report to the UI state store. 

The actual rendering and hiding of the html element is acheived when the
`DropDownMenu`'s class updates. An designation of class `.reveal-hidden`
tells the Menu to hide.

## Loading Options

Remember, the `Toolbar` only creates the space for tools and functions.
It is the `tools-plugin.js` that breathe life into the space by
populating the appropriate tools. This includes responsibility for
calling `toolbar.setMenuItems` and defining `getMenuItems(...)`. 

Menu items for all cases are relatively the same, differing little
except for [state] or [problem/context]-specific links. Many call out to
functions found in [routes.js].

- "About redistricting", navigates to state-page "why?" section using
`scrollToSection` defined in `tools-plugin.js` 
- "About the data", similarly navigates to to state-page "data" section.
- "Save plan", which opens the [`renderSaveModal`], visible on mobile
phones
- "Districtr homepage", returns to homepage with confirmation box
- "New plan", navigates to `/new` url 
- "Print / PDF", simple print from the window
- "Export Districtr-JSON", uses `routes.exportPlanAsJSON(state)`
- "Export Plan as SHP", uses `routes.exportPlanAsSHP(state)` mindful to
inlcuded `COI` in title if warranted
- "Export Plan as GeoJSON", similar as above, with `true` parameter sent
to same function indicating GeoJSON
- "Export assignment as CSV", uses
`routes.exportPlanAsAssignmentFile(state)`
- "Export block assignment file", uses
`routes.exportPlanAsBlockAssignment(state)` if units are Block Groups
- "About import/export options", sent to `/import-export` url in new tab 

# #

### Suggestions

`Menu` does so much by itself, I think it deserve a separate file from
both the `Toolbar`, `tools-plugin.js`. The menu and its options are
loaded only once and the options change little from context to context.

# #


[Return to Main](../README.md)
- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - Previous: [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - Next: [Popups a la Modal](../03toolsplugins/modal.md)

- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully

[state]: ../01contextplan/state.md
[problem/context]: ../01contextplan/plancontext.md

[`Editor`]: ../02editormap/editor.md

[`renderSaveModal`]: ../03toolsplugins/modal.md
[`tools-plugin.js`]: ../03toolsplugins/toolsplugin.md
[`UIStateStore`]: ../03toolsplugins/uistatestore.md
[`Toolbar`]: ../03toolsplugins/toolbar.md

[routes.js]: ../09deployment/routes.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA