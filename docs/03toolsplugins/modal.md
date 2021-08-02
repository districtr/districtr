# Modals

Modals are an alternative way to supply information to the user. When
[`edit.html`] is called, before templates are rendered, a div id
`#modal` is created outside of the main id `#root`. 

##  [`/src/components/Modal.js`]

With its spot in the document reserved by `edit.html`, Modals were
originally defined in `views/edit.js` by [@maxhully] until Wed., Apr. 17
2019 when it was given its own file, `modal.js`. The first modal,
`renderAboutModal()` was written a few months before, at the start of
February. 

Since September of 2019, `Modal.js` has been actively maintained by
[@mapmeld] with updates related to VRA functionality by [@jenni-niels].

There are four different kinds of modals which relies on `renderModal`
to perform. 
- renderModal
- renderSaveModal
- renderAboutModal
- renderVRAAboutModal 

### `renderModal(innerContent)`

Each modal relies on function `renderModal(innerContent)` to render onto
the editor screen. This function takes the div of id `#modal` and
replace  its content with nested divs of class `#modal-wrapper` and 
`#modal-content`. This inner div comes with a close button and space for
icons as well as space for rendering the passed-in `innerContent`. 

### `renderAboutModal(...)` 

The primary purpose of is this modal is to render metadata about the
given information displayed given an context's place and unit. For
instance,  metadata related to `place.id` of 'Arkansas' and
`unitsRecord.id` of 'data' would report that...

> These data were obtained from the US Census Bureau. The block and
blockgroup shapefiles for Arkansas was downloaded from the Census
<a href="https://www.census.gov/geo/maps-data/data/tiger-line.html">TIGER/Line Shapefiles</a>.
Demographic information from the 2010
Decennial Census was downloaded at the block level from
<a href="https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml">American FactFinder</a>.</p>

...which is stored in `/assets/about/arkansas/data.html`, written
together with most entries by [@jenni-niels] in October of 2020.
This render modal is called by `tools-plugin.js` and is currently
disabled. 

### `renderSaveModal(state, savePlanToDB)`

Of vital importance is the Save Modal, which appears when a plan is
saved by [`Toolbar.savePlan(...)`], triggered when pressing the `Save`
button and when this option was previously offered in the `Menu`.

In this case, `savePlanToDB` is called, as a parameter, though it is the
same one in [routes]. Once the server saves the plan and a plan url is
provided, `renderModal` is then called with the save link and other
information. 

According to [@mapmeld], `renderSaveModal` is now used when someone
joins from a Portal and we give them a modal returning to their Portal.

### `renderVRAAboutModal(place)`

Finally, as of June, 2021, [@jenni-niels] is currently building out
[VRA]  functionality. Part of this is implementing a similar About Modal
for this information.

# # 

### Suggestions

- Small snippets of code is saved in a multitude of html files and
folders. Could this be combined as say, a JSON, for simplicity?
- `savePlanToDB1` is passed into the `renderSaveModal(...)` by
`Toolbar`, but this is the same function as in `routes`. Could this be
made into a global method?

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](../03toolsplugins/toolbar.md)
  - [Tabs and Reveal Sections](../03toolsplugins/sections.md)
  - [A List of UI and Display Components](../03toolsplugins/uicomponents.md)
  - [Rendering in Action: OptionsContainer](../03toolsplugins/optionscontainer.md)
  - Previous: [The top-bar Menu](../03toolsplugins/topmenu.md)

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
[@mapmeld]: http://github.com/mapmeld
[@jenni-niels]: http://github.com/jenni-niels

[`/src/components/Modal.js`]: ../../src/components/Modal.js
[`edit.html`]: ../../html/edit.html

[`tools-plugin.js`]: ../03toolsplugins/toolsplugin.md
[`Toolbar.savePlan(...)`]: ../03toolsplugins/toolbar.md
[routes]: ../09deployment/routes.md

[VRA]: ../06charts/vra.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
