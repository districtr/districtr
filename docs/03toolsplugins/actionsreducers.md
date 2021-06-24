# Changing States: Reducers and Actions

In Javascript, a reducer is a function that takes an initial state and
an action and returns a new state. Reducers are used by the
[`UIStateStore`], i.e. `editor.store` in the [`Editor`] object, and is
used when the store is dispatched. A new state is then created and kept. 

## Combining Reducers

The one `reducer` in [`/src/reducers/index.js`] is really a combination
of reducers found in `charts`, `elections` and `toolbar`, which checks
each of the reducers to either return a new state or the old the one
unchanged. The reducers in each class are as follows. These were mostly
written by [@maxhully] in early 2019 and maintained by [@mapmeld] since
early 2020 and in essence describe the complete UI parameters the
website uses to render the information toolbar/panel. 

### `toolbar` reducers 
Like in each of the reducer files, `toolbar` has a list of handlers that
are converted into a actions and reducers. For toolbar, they are...
- `changeTab`, sets new `activeTab`
- `selectTool`, sets new `activeTool`
- `openDropdownMenu`, sets `dropdownMenuOpen` to `true`
- `closeDropdownMenu`, sets `dropdownMenuOpen` to `false`

### The `election` reducer
Only contains one action, `changeElection` which changes the
`activeElectionIndex`.

### `chart` reducers
Chart has many more reducers than the others. 
- `toggleOpen`, switches the property `isOpen` for a chart in the UI
`state`
- `openChart`, ensures property `isOpen` is true for a chart in the UI
`state`
- `addChart`, sets a chart's `isOpen`, `activeSubgroupIndicies` and
`activePartIndex` for a given chart
- `selectSubgroup`, within a given chart, sets `activesubgroupIndicies`,
with a new `subgroupPoistion` and `subgroupIndex` 
- `selectPart`, changes a chart's `activePartIndex`
- `selectAgeView`, changes a chart's `ageView Property`.

## Creating Reducers and Actions

To be combined by `combineReducers`, these handlers must be converted
into reducers. `createReducer` in the [`utils`] does when a new `action`
is triggered. This function will run through each of the handlers to see
if the `action` apply to any of their handlers. If so, a new `state` is
returned. 

In parallel, actions are also created by simply registering the handler
keys in an object `action` with keys that list `actionTypes` determined
by the list of handlers.

Finally, there's a function `bindDispatchToActions(...)` that's suppose
to bind actions to dispatch functions, but isn't used anywhere.

# #

### Suggestion
Many reducer functions are listed in [`utils`]. They're relatively
simple. Can they be listed in the `reducers/` folder for clarity
instead?


# #

[Return to Main](../README.md)

- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)

- Previous: [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- Next: [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/brusherasetools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[`/src/reducers/index.js`]: ../../src/reducers/index.js

[`UIStateStore`]: ../03toolsplugins/uistatestore.md
[`Editor`]: ../02editormap/editor.md

[`utils`]:../10spatialabilities/utils.md