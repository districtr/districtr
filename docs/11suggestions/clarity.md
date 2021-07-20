# Clarity

There are many places where concepts, variables and functions share
similar or identical names. Thus, it's harder to trace for development.
Conversely, many of the same objects serve as arguments or instance
variables in different places and thus goes by different aliases, again,
making development cumbersome. 

I'm a proponent of initializing all possible instance variables at the
construction of an object, so we know what we're dealing with in advance
and eliminate the prospect of `undefined` variables. Adding defaults
could will help further this aim.

## Similar Names, Different Things

### Units

The title "Units" is used in a pair of ways.

- Conceptually, is is the base units of a module, whether precincts or
census geometries. 
- When initializing, `units` is an object specification representation
of these base units saved and loaded by the [context/plan]. This is
saved as `context.units` and `state.unitsRecord`
- Finally, in the [Map index.js], there's also a [`Layer`] titled units
returned by function `addUnits(...)`. This kept in `state.units`
  - Maybe we should rename it "unitsLayer" instead. 
- `.map(...)` is also a common elementary Array function in javascript.

### Options

There are so many different kinds of options, some acting as a
collection of UI for the user, some acting as properties. There's the...
- [`OptionsContainer`], better named `ToolOptionsContainer`
  - [`InspectToolOptions`] and more for each tool
  - [`brushOptions`]
- [`districtingOptions`] for landing pages
- [`LandmarkOptions`], better named `LandmarkProperties` or some such.

### A State?
What is a State? What a dizzying notion! It's by coincidence that we
deal so heavily in both political units and programming concepts. States
are...
  - The [State political unit]
  - The [`State`] object that keep track of a whole plan
  - The [UIStateStore], we could call the "UIStore"
  - The [MapState], the container of the mapbox `map`
  - The [FeatureState], as in the condition properties of a feature?  

### The Parameter

[`Parameter`] has a confusing name. This UI component often behaves like
a "Dropdown Item" but can really be sent any kind of html to render. In
my head, parameter is synonymous to the argument of functions.

## One Thing, Different Names

### The Mapbox-Gl Map

While [`Mapbox`] is a top level object akin to [`Editor`] and
[`Toolbar`], it is its instance variable `map` that is actually used
more often. It is the mapbox-gl instance that most directly talks to the
Mapbox server. Various times it is identified as...
- `mapState.map`
  - Thus also, `editor.mapState.map`
- `State.map` upon construction 
- When any [`Layer`] is created, it is tied to its map.
  - One example: the units `Layer` contains `state.units.map`

The same map is everywhere! See [Global Objects] for more thoughts on
this.

Finally, in [`Map`], notice that `borderId` is usually matched by
`place.id`. A name change could make this clearer. 

### Layers

Speaking of layers, Layer is used typically to describe `Layer` object,
however, upon its construction, it is sent an object also called
`layer`, a json object that serves as a specification argument. Would it
be clearer to call this parameter say, "layerspecs"? 

### ColorsAffected

Through the [ToolsPlugin], [ContiguityChecker] and [NumberMarkers] take
a `ColorsAffected` variable. Is this the same as `ChangedColors` in 
[`Brush`]? 

### [Routes]

In `savePlanToDB`, the `state` argument is serialized and in the
request body, it is stringified and parsed. I might be wrong, but this
seems to turn an object into a string and back into an object again.
What is the advantage of this process?

In many places, the `serialized` variable. Often, it's simply to help
convert it into a string object. Other times, like in routes, what is
the difference between using `serialized` and the `state` object
directly?

### HorizontalBarChart

The one in `PopulationChart` is svg based, the one in
`HorizontalBarChart.js` used in `Tooltips` is html based.

## Post Construction Instance Variables 

- [`NumberMarkers`] creates new instance variables for [`Editor`] that
are only dependent on the number of parts. We could not only initialize
this at the construction of [`Editor`], but complete the generation of
the layer and its icons at the start.
- A reminder that `state.population` is not initialized in the initial
creation of the [`State`] object.
- [`Toolbar`]'s `this.state`, is not initialized in the constructor.
-It's easier to understand the function of the [`Brush`] object when its
instance variables are defined at the start. This is so for its...
  - `this._previousColor`
  - `this.erasing`
  - `this.cursorUndo`
  - `this.trackRedo`.
- This is also true of Brush's sibling [Tooltip], where `this.visible`,
`this.x`, `this.y` and more are not initialized in the constructor.

## Default Values

### Decimals

The [`DemographicsTable`] and related functions rely on argument
`decimals` to format the display of values. It may have once been a
strict bool but now it can hold three values, `true`, `false` and
`"population"`! `True` and `false` should be renamed. 

### Other Suggestions
- Should we set a default `hide-me` value `false` in the `Tool`
constructor to be clear?
- We should go ahead and set a default value for the `renderToolbar`
parameter in `BrushToolOptions`, as it is always set to `undefined` when
it is called. In fact, it is called in each of the `BrushToolOptions`'
instance methods and is ultimately only set to re-render the Editor when
the `BrushTool` is added by to the `Toolbar` by the `addTool(...)`
function. It could almost be hard coded. 

## Odds and Ends

- In `DatasetInfo` Directives come from AngularJS, whereas we use lit-html
throughout Districtr for templating. Can't we just use lit-html to
populate this text?
- In `SelectBoxes`, defined in [Demographics Table], "Comapare" and
"with" are contained in an Array, but "and" is a special case. Should
they just be in one array?
- In the [state pages], the population of districting and community
cards occurs later than when it is given structure in the HTML. Maybe
they should be placed closer together for clarity.

# #
[Return to Main](../README.md)
- [My Personal Philosophy on Functions](../11suggestions/philosophy.md)
- Previous: [Deprecations and Experimental Features](../11suggestions/deprecations.md)
- Next: [Logical Redundancies](../11suggestions/logic.md)
- [Organization](../11suggestions/organizing.md)
- [The Heavy Lift: (Not) Global Objects](../11suggestions/globalobjects.md)
- [Other Notes](../11suggestions/other.md)

[context/plan]: ../01contextplan/plancontext.md
[`State`]: ../01contextplan/state.md

[Map index.js]: ../02editormap/map.md
[`Layer`]: ../02editormap/layer.md
[MapState]: ../02editormap/map.md
[`Mapbox`]: ../02editormap/map.md
[`Editor`]: ../02editormap/editor.md
[`Layer`]: ../02editormap/layer.md
[`Map`]: ../02editormap/map.md
[NumberMarkers]: ../02editormap/numbermarkers.md
[`NumberMarkers`]: ../02editormap/numbermarkers.md

[UIStateStore]: ../03toolsplugins/uistatestore.md
[`InspectToolOptions`]: ../03toolsplugins/inspecttool.md
[`OptionsContainer`]: ../03toolsplugins/optionscontainer.md
[`brushOptions`]: ../04drawing/brush.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[`Parameter`]: ../03toolsplugins/uicomponents.md
[ToolsPlugin]: ../03toolsplugins/toolsplugin.md

[FeatureState]: ../04drawing/brush.md
[ContiguityChecker]: ../04drawing/contiguity.md
[`Brush`]: ../04drawing/brush.md
[Tooltip]: ../04drawing/tooltip.md

[`LandmarkOptions`]: ../05landmarks/landmarksclass.md

[Demographics Table]: ../06charts/demographicstable.md 
[DemographicsTable]: ../06charts/demographicstable.md 
[`DemographicsTable`]: ../06charts/demographicstable.md
[`DatasetInfo`]: ../06charts/datasetinfo.md

[`districtingOptions`]: ../07pages/districtrstatepages.md
[State political unit]: ../07pages/districtrstatepages.md
[state pages]: ../07pages/districtrstatepages.md

[Global Objects]: ../09deployment/globals.md
[Routes]: ../09deployment/routes.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA
