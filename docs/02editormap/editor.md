# The Editor
_Commentary by [@gomotopia][1], May 2021_

<img src="./pics/edit.png" width=50%>

Districtr's primary tool for engaging with district maps is known as the
Editor. According to the [deployment][2], requests to address /edit/ are
sent to [edit.html][3], which loads  a compiled version of edit.js that
corresponds to [src/views/edit.js][4]. One can arrive here by including
a saved plan link or by navigating in from the state portals.

[lit-html][5] is the framework we use to connect javascript to html
templates for rendering. 

> [Context][6] is another name for map-plan or saved-state, the
structure behind the JSON object that keeps units and assignments for
each plan. 

## [src/views/edit.js][4]
First written by [@maxhully][7], betwen January and August 2019.
Maintained by [@mapmeld][8] since September of 2019. VRA functionality
added by [@jenni-niels][9]. 

### Imports
Important imports include...
- MapState
- State
- External plan functions from [routes.js][10]
- Editor
- various plugins
- various utilities. 

### Rendering
The default renderer function, `renderEditView()`, simply calls
`getPlanContext(...)` and passes this context to `loadContext(context)`.

### function getPlanContext()
Before an editor is loaded, getPlanContext retrieves any potential
context a variety of ways. First, `getPlanURLFromQueryParameter()` is
called in case a context is provided by the URL. This URL could either
be a saved plan with a URL, often marked by marked by `edit`, `coi"`, or
`plan`. These are retrieved by function `routes/loadPlanFromURL()`. If
no old plan or new context is found, a default
`routes/getContextFromStorage()` is loaded.

### function loadContext(context)

Once a context is gathered from the URL, local context or default
storage, loadContext renders in html...
- div `comparison-container` of class `mapcontainer`
    - divs `map` and `swipemap` of class `map`
- div `toolbar`
- div `print-only summary`.

Within the HTML, these divs form the foundation of the HTML editor GUI.

Using the context, a new const [`mapState` of class `MapState`][11] is
created. The Districtr window title now officially reports as loading. 

If the context was loaded through a saved plan, a shortened URL is
displayed. Other functionality is included in case a plan file is
dragged onto the map. 

When the mapbox area held by the `mapState` is complete, a **new
[Editor][13] object is ready to be created**, with `mapState`,
[`State`][12] and a list of [plugins][14]. 

The `State` object stores properties of the local `mapState` and signals
to the browser that loading is complete. Any assignments that remain
from the context is also loaded.

A new `Editor` model object is instantiated with the new State object
the local `mapState` and a relevant list of plugins. The rendering of
this Editor model causes the browser to complete its rendering of the
GUI HTML. 

### Helper Functions

Other helper functions include `getPlugins(context)` which provides a
list of relevant plugins listed in constants `defaultPlugins` and 
`communityIdPlugins`. When a new MapState is created, helper function
`getMapStyle(context)` is used to provide style defaults. When the plan
URL is nee`d by `getPlanContext()` or `loadContext()`'s short URL
display, it is retrieved by `getPlanURLFromQueryParam()`. 

### Special Cases

Contexts with `coi2` units or of `community` problem type are assigned
different plugins. Map styles are also hard coded in
`getMapStyle(context)`. The class of the document `body` also changes
if context units are `coi2` or `vra`. Map default settings are also
governed by `coi2` and `vra`.

<a name="Editor"></a># The Editor Object

<img src="./pics/EditorObject.png" width=50%>

## [src/models/edit.js][17]

The `Editor` model class was written by [@maxhully][7] in April of 2019.
It is currently maintained by [@mapmeld][8]. This model class contains
the `render` function needed by [lit-html][5] to display editing tools. 

### Imports

Important imports include... 
- `UIStateStore`
- a reducer
- `Toolbar` 

## default class Editor

Kept as a model, the editor object contains...
- `this.render` which keeps the render functions for external use.
- [`this.mapState`][11] and [`this.state`][12] which stores passed in
parameters.
- `this.store`, a [`UIStateStore`][15] which keeps track of which menus
or toolbars are in use and requires a [reducer][15]. 
- `this.toolbar`, which stores a [`Toolbar`][16] object that keeps this
Editor and its store in mind. Editor depends on its toolbar property to
render the each of the contents of the toolset in html.

The Editor object assigns itself to each of the plugins and the render
function calls on its own Toolbar to render. The editor's render
function is subscribed to (waits for) this.store and this.state.


# IDColumn Class

Only in State.js

```
export default class IdColumn {
    constructor({ key, name }) {
        this.key = key;
        this.name = name;
    }
    getValue(feature) {
        if (feature.properties === undefined) {
            return undefined;
        }
        return feature.properties[this.key];
    }
}
```

### Observations

- Similar to the MapState and Toolbar objects, only one Editor is
created per window. Could this be a global variable?
- Plugins require but are independently created from the Editor. Could
these be created in views/edit.js instead?
- UIStateStore is only created once, here. Couldn't reducer be imported
in the UIStateStore file? 
- For simplicity's sake, file drag-and-drop functionality in edit.js
should be written in a different function or dropped.
- When rendering edit.js, div `#comparison-container` may be
experimental


# # 

[Return to Main](../README.md)
- Previous: [How is the Districtr Editor page loaded?](./initialization.md)
- Next: [The Map Object](./map.md)
- [Adding Layers](./layer.md)
- [Number Markers](./numbermarkers.md)

[1]: http://www.github.com/gomotopia
[2]: ../deploy/_redirects
[3]: ../html/edit.html
[4]: ../src/views/edit.js
[5]: https://lit-html.polymer-project.org/
[6]: ./plancontext.md
[7]: http://www.github.com/maxhully
[8]: http://www.github.com/mapmeld
[9]: http://www.github.com/jenni-niels
[10]: ./routes.md
[11]: ./map.md
[12]: ./state.md
[13]: #Editor
[14]: ./plugins.md
[15]: ./store.md
[16]: ./toolbar.md
[17]: ../src/models/editor.js