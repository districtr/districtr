# Initialization
How is the Editor and its tools loaded?

To navigate to the editor, whether directed by URL, deploy/_redirects
or routes.js to districtr.com/plan/, /edit/ or /COI/, per package.json
we’re sent us to edit.html, the template that implements view/edit.js

## The Editor

Within view/`edit.js`, the default function `renderEditView()` calls
`getPlanContext()` and `loadContext(context)`.

## The Three Ways

There are roughly three ways a context/plan is loaded into the editor. 
One way to load a plan is by entering the **URL of a saved plan,** where
it is read and directed by getPlanContext(). For example, the common way
is to take a URL akin to https://districtr.org/plan/20402, extract
planid 20402 and use loadPlanFromURL in routes to return a context. 

The second way is by using **locally stored** data. State portals
provide various options for creating new maps. The selected problem is then saved
in `LocalStorage.savedState` to be read by `getPlanContext()`.

Finally, one can **drag and drop a plan** into the browser in the next function,
`loadContext(context).`

## Creating a Framework
While in views/editor.js, `loadContext(context)` begins the process of rendering
the html page by creating divs of class `.map` and id `.toolbar`. A new `MapState`
is created, the object tasked with controlling the Mapbox object we use in our display.
Once this DOM structure is in place, we have the option to drag and drop a map csv or
json file, using functions in /routes to provide a context.

Ultimately, when the mapbox instance object within Map loads, we’re ready to create a
new `State` object and `Editor` object, which we render. It is also here that select
the toolbar `plugins` we’ll use based on the loaded context.  

## Rendering the Editor object
Separate from views/edit.js is models/editor.js that holds the object of a lit-html
type model that renders the page. Each Editor instance has child `UIStateStore` and
`Toolbar` instance variables and instance function render, which directs the local
Toolbar instance to create a DOM framework for the toolbar and the assignment of
this Editor to various plugins. The plugins will render themselves into the toolbar.
`UIStateStore` then keeps track of any subsequent user tool and editing selections. 

## The Map
The Map folder holds components related to the map and its `index.js` holds the
definition for the `MapState` class. An object of this type is initialized by
`getPlanContext()` in edit.js, updated as a context plan is loaded. This `MapState`
will ultimately be sent to serve as an instance variable of the new `Editor` object.

`MapState` objects are simple and contain only the map controller and navigation. This
map object will ultimately have other Layers added to it by the State object. 

## The State
Since the `State` Object contains the running tally of the context (particularly
assignments) as it is edited, it is natural for the State object to initialize the
Map and does so by adding Layers back to the mapbox controller as appropriate.

## The UIStateStore
The `UIStateStore` is a simple object that contains all the `reducers` required to
switch from one state to the next depending on user interaction.

## The Toolbar

The front-end, toolbar side-panal is rendered by the `Toolbar` Object, responsible for
rendering the structure of the toolbar with a top bar for tools and saving, and elements
like an `OptionsContainer`, and Dropdown Menu Buttons. Earlier, the Editor was assigned
to various plugins that render themselves into the toolbar. 

According to `editor.js`, plugins depend on the type of plan/problem. No matter the
problem, `ToolsPlugin` is always loaded and loads the standard set of tools for editing
the map, namely the `BrushTool`, the `EraserTool`, `InspectTool` and `PanTool`. 

Other plugins are loaded depending on whether the we're in COI mode.





