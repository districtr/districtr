
## Display Components

What the users see on the screen is a nesting of different UI elements.

The `Editor` holds both the `Toolbar` and the `MapState`.

The `Toolbar`, inflated by `toolsplugin.js` has areas for the tools
list, the top menu and tool options followed by many tabs.

`Tab`s hold information and UI provided by the plugins. Each `Tab`
might have several `RevealSection`s. Typically, `Tab`s are created, 
subelements are applied to it, and once done, it is loaded into `Toolbar`.
The `LayerTab` is an example where the `Tab` is implemented as an
inheritor class rather than an instance object. 

The Reveal Sections themselves may have different charts, tables, 
drop-down menus with `Parameter`s or checkboxes. 

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](./toolbar.md)
- [The Tools-Plugin prevails](./toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./tool.md)
  - [Brush and Erase Tools](./BrushEraseTools.md)
  - [Inspect Tool](./inspecttool.md)
- [Popups a la Modal](./modal.md)
- [The top-bar Menu](./topmenu.md)
- [Rendering in Action: OptionsContainer](./optionscontainer.md)
- [UIStateStore](./uistatestore.md)
- [Actions and Reducers](./actionsreducers.md)
- Previous: [A List of UI and Display Components](./uicomponents.md)