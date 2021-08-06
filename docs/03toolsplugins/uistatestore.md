# The UIStateStore

The `UIStateStore` is a simple class that keeps track of a user's 
interaction with districtr's interface. It was written by [@maxhully]
on Mon., Jan. 19, 2019, who edited this only once more a few months
later on Wed., May 1.

The UIStateStore is created once when the [`Editor`] is initialized. 
The [`reducer`] is passed in together with an object indicating an
initial state of several objects as follows:
- `toolbar`
  - The current `activeTab` set in `Editor`, and the `dropdownMenuOpen` option set to False
- `elections` 
  -  With one entry, `activeElectionIndex` set to 0
- `charts`
  - Set to an empty object

## Construction

With both parameters set to `this.reducer` and [`this.state`], another
instance variable is created, `this.subscribers` set to an empty array.
An option for `this.DEBUG` is also offered, and both `dispatch` and
`subscribe` methods are bound to this instance. 

## Dispatch and Subscription 

When an action is made, `dispatch(action)` is called to update
everyone's state. If debug is on, a console is logged. Then, a reducer
returns a new `nextState` based on the current state and the new action.
If this is indeed a new state, `this.state` is updated to the new state
and each `subscription` is subsequently updated in turn.

The `subscribe` function is essentially pops a new subscriber to the
subscriber list. Only the `render` function of the `Editor` is ever
subsribed to this `UIStateStore`. The `dispatch` function is used in
many places, with one of many `actions` passed in. It is also often
passed in as a parameter in many [UI classes]. (Other UI classes issue
the js standard `dispatchEvent`). 

## What is a reducer?

In general, reducers simply take the current state and an action and
returns a new state. Our reducer, defined in `src/reducer` is merely a
combination of the `elections`, `toolbar` and `charts` reducers. 
For more information, refer to our page on [reducers].

# #

### Suggestions

- If we use a series of dispatch events to rerender different pieces of
the document, do we need to call `renderToolbar` in the methods of
`brushTool`? 
- In the `dispatch` function, each subscriber is passed a pair of
parameters that are ultimately not used by the subscribed function
(which is only ever `editor.render`) 

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

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[@maxhully]: http://github.com/maxhully
[`Editor`]: ../02editormap/editor.md
[`reducer`]: ../03toolsplugins/actionsreducers.md
[reducers]: ../03toolsplugins/actionsreducers.md
[`this.state`]: ../01contextplan/state.md
[UI classes]: ../03toolsplugins/uicomponents.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA