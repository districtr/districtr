# An immodest proposal: Global Objects

Originally, it was exhausing tracing through all the arguments in the
chain of nested functions that renders districtr. My original thought
was that since the [`Editor`] and its possesions [`MapState`] (with its
map), ['Toolbar'] and [`UIStateStore`] were used often and created only
once that these were great candidates to make into global objects.

Turns out, this is an **awful idea.** Since we're a Node package, node
discourages global variables. Programmers are routinely discouraged
against creating strictly global variables. This warning is particularly
strong because two functions may be acting upon a function
simultaneously, which would create indeterminable results. 

Instead, we can investigate the variables that are pseudo-global and
investigate ways we can make the common objects used above easier to
handle. A good example of this are the many settings and reference
tables that we can import into functions like [`utils.js`].

## Window variables

One way we can create variables seen by different functions is by 
adding it to the `window` module. The `window` object, maintained by
the browser is typically very full, but we use this form for...

- Natural window variables
    - `window.URL`
    - `window.timeOut(...)`
    - `window.href`
- Mapbox related variables
    - `window.location`
    - `window.mapslide`
- keeping track of our own selves
    - `window.selectLandmarkFeature`
    - `window.planNumbers`
    - `window.coalitionGroups`

## Consistent Arguments

Since not everything can be a global variable, we pass them down a tree
of functions. However, as described in [this chapter], we notice that, 
say, the mapbox-gl [map] is used many ways. You've got `mapState.map`,
`editor.mapState.map`, `layer.map` and so on.

This multiple ways of addressing the same object is all over districtr.
Thus, I propose that we should pass in [`Editor`] as much as we can, 
knowing that it contains `editor.mapState` (maybe even `editor.map`), 
`editor.toolbar`, `editor.store` and `editor.state`. All sub units
contain its own `this.editor` and derive what it needs through this
single object.  

> Like, does [`state`] need to have its own [`brush`] as [ToolsPlugin]
suggests? This turns a tree into a web.

## Collected Settings

### Spatial Abilities by Module

Each module has its own needs and personalities. Most, but not all, of
these exceptions are carried by [`spatial_abilities`] in the
[`utils.js`] file. We should consider all the many ways modules can be
different, including different layers, different features, different
nouns, mapbox base maps and more. Then, with this comprehensive listing
and smart use of default values, we can create a more robust
`spatial_abilities` object with its own file to reduce the number of
[Place Exceptions] written in the code. More discourse on logic is
contained [later this chapter].

### Reference Tables by State

Rather than settings unique to each module, i.e. [Plan/Context], there
many settings unique to each state, like FIPS code and whether their
districts are multi-member or otherwise. This is usually located in
`utils.js` with the exception of constant `ABBREVIATIONS` kept in the
`Subgroup` class. This should be moved. State settings could even be
moved to its own file. 

Finally, `altcounties`, where Louisiana Parishes and Alaska Boroughs
serve as Counties, should be set by State rather than `place` because
`place` could refer to alternative datasets or local municipalities.

### Census Codes

`vapEquivalents` is a reference table in `DataLayersPlugin` that
converts standard census population codes into vap codes. Could this be
parsed out to a reference file?
    - This is the classic "Total Population" as `"TOTPOP"`

### Display Settings

Display settings for the various charts could be kept in its own utils
file. For instance, there are many hard-coded consts related to the
[PopulationBarChart] and [NumberMarkers]. Collecting display variables
in one place reduces the daunting prospect of editing javascript, even
if its simple to adjust a few constants.

### Events

Just as there are state and module specific settings, we can make a
util directory that stores [event] specific information like links,
content and other fields.

# # 

[Return to Main](../README.md)
- [My Personal Philosophy on Functions](../11suggestions/philosophy.md)
- [Deprecations and Experimental Features](../11suggestions/deprecations.md)
- [Clarifying Operations](../11suggestions/clarity.md)
- [Logical Redundancies](../11suggestions/logic.md)
- Previous: [Organization](../11suggestions/organizing.md)
- Next: [Other Notes](../11suggestions/other.md)


[Plan/Context]: ../01contextplan/plancontext.md

[`Editor`]: ../02editormap/editor.md
[`MapState`]: ../02editormap/map.md
[map]: ../02editormap/map.md
[NumberMarkers]: ../02editormap/numbermarkers.md

[`state`]: ../01contextplan/state.md
[`brush`]: ../04drawing/brush.md
[ToolsPlugin]: ../03toolsplugins/toolsplugin.md

['Toolbar']: ../03toolsplugins/toolbar.md
[`UIStateStore`]: ../03toolsplugins/uistatestore.md

[PopulationBarChart]: ../06charts/populationbarchart.md

[event]: ../08events/event.md

[`utils.js`]: ../10spatialabilities/utils.md

[`spatial_abilities`]: ../10spatialabilities/spatialabilities.md
[Place Exceptions]: ../10spatialabilities/placeexceptions.md

[this chapter]: ../11suggestions/clarity.md
[later this chapter]: ../11suggestions/logic.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA


