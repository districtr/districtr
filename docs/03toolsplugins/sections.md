## Display Components

What the users see on the screen is a nesting of different UI elements.

The [`Editor`] rednders the structure which holds that which both
[`Toolbar`] and the [`MapState`] renders.

The `Toolbar`, inflated by [`toolsplugin.js`] has areas for the tools
list, the top menu and tool options followed by many tabs.

`Tab`s hold information and UI provided by the plugins. Each `Tab`
might have several `RevealSection`s. Typically, `Tab`s are created, 
subelements are applied to it, and once done, it is loaded into
`Toolbar`. The `LayerTab` is an example where the `Tab` is implemented
as an inheritor class rather than an instance object. 

The Reveal Sections themselves may have different charts, tables, 
drop-down menus with [`Parameter`s or checkboxes].

# #


[Return to Main](../README.md)
- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - Next: [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - [The top-bar Menu](../03toolsplugins/topmenu.md)
  - [Popups a la Modal](../03toolsplugins/modal.md)

- [UIStateStore](../03toolsplugins/uistatestore.md)
- [Actions and Reducers](../03toolsplugins/actionsreducers.md)

- [The Tools-Plugin prevails](../03toolsplugins/toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](../03toolsplugins/tool.md)
  - [Brush and Erase Tools](../03toolsplugins/BrushEraseTools.md)
  - [Inspect Tool](../03toolsplugins/inspecttool.md)

- [Plugins!](../03toolsplugins/plugins.md)
  - The Tools Plugin (See Above)
  - The Data Layers Plugin (See Chapter 06)
  - The Multi Layers Plugin (See Chapter 06)
  - The Community Plugin (See Chapter 05)
  - The Population Balance Plugin (See Chapter 06)

[`Editor`]: ../02editormap/editor.md
[`MapState`]: ../02editormap/map.md

[`Toolbar`]: ../03toolsplugins/toolbar.md
[`toolsplugin.js`]: ../03toolsplugins/toolsplugin.md

[`Parameter`s or checkboxes]: ../03toolsplugins/uicomponents.md
