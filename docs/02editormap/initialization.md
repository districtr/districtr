# Initialization
How is the Editor and its tools loaded?

To navigate to the editor, whether directed by URL,
[`deploy/_redirects`] or by [`routes.js`] to districtr.com/plan/, /edit/
or /COI/ per [`package.json`], we’re sent us to [`edit.html`],
the template that implements [`views/edit.js`].

## The Editor

Within `view/edit.js`, the default function `renderEditView()` calls
`getPlanContext()` and `loadContext(context)`.

<img src="../pics/edit.png" width=75%>

## The Three Ways

There are roughly three ways a context/plan is loaded into the editor. 
One way to load a plan is by entering the **URL of a saved plan,** where
it is read and directed by `getPlanContext()`. For example, the common
way is to take a URL akin to https://districtr.org/plan/20402, extract
planid 20402 and use loadPlanFromURL in routes to return a context. 

The second way is by using **locally stored** data. State portals
provide various options for creating new maps. The selected problem is
then saved in `LocalStorage.savedState` to be read by
`getPlanContext()`.

Finally, one can **drag and drop a plan** into the browser in the next
function, `loadContext(context).`

## Creating a Framework
Inside `views/editor.js`, `loadContext(context)` begins the process of
rendering the html page by creating divs of class `.map` and id
`.toolbar`. Once this DOM structure is in place, we have the option to
drag and drop a map csv or json file, using functions in /routes to
provide a context.

It is also here that we created [`MapState`], the object tasked with
controlling the Mapbox object we use in our display.

Users interact with the layers loaded in the [`mapbox instance`] 
within `MapState`. Once that loads, we’re ready to create a new `State`
object and `Editor` object, which we render. It is also here that select
the toolbar [`plugins`] we’ll use based on the loaded context.  


## Rendering the Editor object
Separate from `views/edit.js` is the `Editor` object, described in 
[`models/editor.js`], an implementation of a lit-html type model that
renders the page. Each Editor instance has child [`UIStateStore`] and
`Toolbar` instance variables and instance function render, which directs
the local Toolbar instance to create a DOM framework for the toolbar and
the assignment of this Editor to various plugins. The plugins will
render themselves into the toolbar. `UIStateStore` then keeps track of
any subsequent user tool and editing selections. 

## The Map
The [`/src/map`] folder holds components related to the map and its
[`index.js`] holds the definition for the [`MapState`] class. Function
`getPlanContext()` initializes this map object within `edit.js` and as
a context plan is loaded, the map object is further updated. This
`MapState` will ultimately be sent to serve as an instance variable of
the new `Editor` object.

`MapState` objects are simple and contain only the map controller and
navigation. Typically, its `mapbox map` object is used the most to add
[`Layers`] and handle user interaction.

## The State
Since the [`State`] Object contains the running tally of the context
(particularly assignments) as it is edited, it is natural for the
`State` object to initialize the `Map` and does so by adding `Layers`.

## The UIStateStore
The [`UIStateStore`] is a simple object that contains all the
[`reducers`] required to switch our interface from one state to the next
through user interaction.

## The Toolbar

The front-end, toolbar side-panel is rendered by the [`Toolbar`] Object,
responsible for rendering the structure of the toolbar with a top bar
for tools and saving, and elements like an [`OptionsContainer`], 
and the [dropdown menu]. Earlier, the `Editor` was assigned
to various plugins that render themselves into the toolbar. 

According to `editor.js`, plugins depend on the type of plan/problem.
For instance, no matter the problem, [`ToolsPlugin`] is always loaded
and loads the standard set of tools for editing the map, namely the
[`BrushTool`], the [`EraserTool`], [`InspectTool`] and [`PanTool`]. 

Other plugins are loaded depending on whether the we're in communities
mode.

# # 

[Return to Main](../README.md)
- Next: [edit.js and the Editor Object](../02editormap/editor.md)
- [The Map Object](../02editormap/map.md)
- [Adding Layers](../02editormap/layer.md)
- [Number Markers](../02editormap/numbermarkers.md)
- [Layer Overlay](./02editormap/layeroverlay.md)

[plan/context]: ../1contextplan/plancontext.md
[`State`]: ../1contextplan/state.md

[`Editor`]: ./editor.md
[`Map`]: ./map.md
[`MapState`]: ./map.md
[`MapState.map`]: ./map.md#map
[`mapbox instance`]: ./map.md#map
[`Layers`]: ./layer.md
[`map/Layer`]: ./layer.md
[`addLayers`]: ./layer.md

[`Toolbar`]: ../3toolsplugins/toolbar.md
[`UIStateStore`]: ../3toolsplugins/uistatestore.md
[`OptionsContainer`]: ../3toolsplugins/optionscontainer.md
[dropdown menu]: ../3toolsplugins/topmenu.md

[`reducers`]: ../3toolsplugins/actionsreducers.md
[`plugins`]: ../3toolsplugins/plugins.md
[`BrushTool`]: ../3toolsplugins/BrushEraseTools.md
[`EraserTool`]: ../3toolsplugins/BrushEraseTools.md
[`InspectTool`]: ../3toolsplugins/inspecttool.md
[`PanTool`]: ../3toolsplugins/tool.md
[`ToolsPlugin`]: ../03toolsplugins/toolsplugin.md

[`utils`]: ./utils.md
[`./lib/column-set`]: ./columnset.md

[`deploy/_redirects`]: ../09deployment/headersredirects.md
[`routes.js`]: ../09deployment/routes.md

[`package.json`]: ../package.md

[`/src/map`]: ../../src/map
[`edit.html`]: ../../html/edit.html

[`src/models/State.js`]: ../../src/models/State.js
[`edit.js`]: ../../src/views/edit.js
[`views/edit.js`]: ../../src/views/edit.js
[`State.js`]: ../../src/models/State.js
[`map/index.js`]: ../../src/map/index.js
[`index.js`]: ../../src/map/index.js
[`src/map/index.js`]: ../../src/map/index.js
[`models/editor.js`]: ../../src/models/editor.js
