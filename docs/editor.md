# The Editor
_Commentary by [@gomotopia][1], May 2021_

Districtr's primary tool for engaging with district maps is known as the
Editor. According to the [deployment][2], requests to address /edit/ are
sent to [edit.html][3], which loads [edit.js][4], which ultimately
corresponds to [src/views/edit.js][5]. 

lit-html[6] is the framework we use to connect javascript to html
templates for rendering. 

> Context is another name for map-plan or saved-state, the serialized object that keeps units and assignments for each plan. 

## src/views/edit.js
First written by [@maxhully][7], betwen January and August 2019.
Maintained by [@mapmeld][8] since September of 2019. VRA functionality
added by [@jenni-niels][9]. 

### Imports
Important imports include...
- MapState
- State
- External plan functions from ../Routes
- Editor
- various plugins
- various utilities. 

### Rendering
The default renderer, renderEditView() simply, calls getPlanContext and
passes this context to loadContext.

### function getPlanContext()
Before an editor is loaded, getPlanContext retrieves any potential
context a variety of ways. First, getPlanURLFromQueryParameter is called
in case a context is provided by the URL. This URL could either be a
saved plan with a URL or from the current session, whose URL is marked
by `edit`, `coi"`, or `plan.`

```
Examples here.
```

These are retrieved by function loadPlanFromURL. If no old plan or new context is found, a default getContextFromStorage is loaded. Both function are imported from routes. 

### function loadContext(context)

Once a context is gathered from the URL, local context or default
storage, loadContext renders in html...
- div `comparison-container` of class `mapcontainer`
    - divs `map` and `swipemap` of class `map`
- div `toolbar`
- div `print-only summary`.

Within the HTML, these divs form the foundation of the HTML editor GUI.

Using the context, a new const `mapState` of class `MapState` const is created. Special cases are applied if `coi2` or `vra` is applicable, and the Districtr editor is now officially loading. 

If the context was loaded through a saved plan, a shortened URL is
displayed. Other functionality is included in case a plan file is
dragged onto the map. 

With those caveats in mind the **`mapState` object is updated on document load.** Here, the editor is assigned two new variables, a
`State` and an `Editor`.

The `State` object stores properties of the local `mapState` and signals
to the browser that loading is complete. Any assignments that remain
from the context is also loaded. 

A new `Editor` model object is instantiated with the new State object the local `mapState` and a relevant list of plugins. The rendering of
this Editor model causes the browser to render the GUI HTML. 

### function getPlanContext()

Other helper functions include `getPlugins(context)` which provides a
list of relevant plugins listed in constants `defaultPlugins` and 
`communityIdPlugins`. When a new MapState is created, helper function
`getMapStyle(context)` is used to provide style defaults. When the plan URL is nee`d by `getPlanContext()` or `loadContext()`'s short URL
display, it is retrieved by `getPlanURLFromQueryParam()`. 

## src/models/edit.js

The `Editor` model class was written by [@maxhully][7] in April of 2019.
It is currently maintained by [@mapmeld][8]. This model class contains
the `render` function needed by lit-html to display editing tools. 

### Imports

Important imports include... 
- `UIStateStore`
- a reducer
- `Toolbar` 

### The Editor Object
The editor object contains...
- `this.render` which keeps the render functions for external use.
- `this.mapState` and `this.state` which stores passed in parameters.
- `this.store`, a `UIStateStore` which keeps track of which menus or
toolbars are in use.
- `this.toolbar`, which stores a `Toolbar` object that keeps this Editor and its store in mind. Editor depends on its toolbar property to
render the each of the contents of the toolset in html.

The Editor object assigns itself to each of the plugins and the render
function depends on the proper loading of the Editor's state and store
objects. 



[2]: /deploy/_redirects