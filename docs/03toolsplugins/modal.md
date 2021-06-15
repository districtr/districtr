# Modals

Modals are an alternative way to supply information to the user. When `edit.html`
is called, before templates are rendered, a div id `#modal` is created outside of
the main id `#root`. 

##  `/src/components/Modal.js`

With its spot in the document reserved by `edit.html`, Modals were originally
defined in `views/edit.js` by [@maxhully] until Wed., Apr. 17 2019 when it was given its
own file, `modal.js`. The first modal, ` renderAboutModal()` was written a few months
before, at the start of February. 

Since September of 2019, `Modal.js` has been actively maintained by [@mapmeld] with updates
related to VRA functionality by [@jenni-niels].

There are three different kinds of modals which relies on `renderModal` to perform. 

- renderModal
- renderSaveModal
- renderAboutModal
- renderVRAAboutModal 

### `renderModal(innerContent)`

Each modal relies on function `renderModal(innerContent)` to render onto the
editor screen. This function takes the div of id `#modal` and replace 
its content with nested divs of class `#modal-wrapper` and `#modal-content`.
This inner div comes with a close button and space for icons as well
as space for rendering the passed-in `innerContent`. 

### `renderAboutModal(...)` 

The primary purpose of is this modal is to render metadata about the given
information displayed given an context's place and unit. For instance, 
metadata related to `place.id` of 'Arkansas' and `unitsRecord.id` of 'data'
would report that...

> These data were obtained from the US Census Bureau. The block and blockgroup
shapefiles for Arkansas was downloaded from the Census
<a href="https://www.census.gov/geo/maps-data/data/tiger-line.html">TIGER/Line Shapefiles</a>.
Demographic information from the 2010 Decennial Census was downloaded at the block
level from <a href="https://factfinder.census.gov/faces/nav/jsf/pages/index.xhtml">American FactFinder</a>.
</p>

Which is stored in `/assets/about/arkansas/data.html`, written together with most
entries by [@jenni-niels] in October of 2020. This render modal is called by `tools-plugin.js`
and is currently disabled. 

_combine?_

### `renderSaveModal(state, savePlanToDB)`

Of vital importance is the Save Modal, which appears when a plan is saved by `Toolbar.savePlan(...)`,
triggered when pressing the `Save` button and when this option was previously offered in the `Menu`.

In this case, `savePlanToDB` is called, as a parameter, though it is the same one in routes.
Once the server saves the plan and a plan url is provided, `renderModal` is then called
with the save link and other information. 

_global?_ 

### `renderVRAAboutModal(place)`

Finally, as of June, 2021, [@jenni-niels] is currently building out VRA functionality. Part of this 
is implementing a similar About Modal for this information.

# # 

### Suggestions

- Small snippets of code is saved in a multitude of html files and folders. Could this be combined as
say, a JSON, for simplicity?
- `savePlanToDB1` is passed into the `renderSaveModal(...)` by `Toolbar`, but this is the same 
function as in `routes`. Could this be made into a global method?

# #

[Return to Main](../README.md)
- [Making space for the Toolbar](./toolbar.md)
- Previous: [The Tools-Plugin prevails](./toolsplugin.md)
  - [The `Tool` Class and The `Pan` Tool](./tool.md)
  - [Brush and Erase Tools](./BrushEraseTools.md)
  - [Inspect Tool](./inspecttool.md)
- Next: [The top-bar Menu](./topmenu.md)
- [Rendering in Action: OptionsContainer](./optionscontainer.md)
- [UIStateStore](./uistatestore.md)
- [Actions and Reducers](./actionsreducers.md)
- [A List of UI and Display Components](./uicomponents.md)
- [Tabs and Reveal Sections](./sections.md)
