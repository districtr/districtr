# Deprecations

As districtr has grown, many new features have been tried. Many have
stuck, but as the program has evolved, the code still retains old lines
of features that have been replaced.

## Vestigial Features

Traces of features that were written and later removed are still
evident in the code, making it harder to read.

### PlacesMap

A classic example of a more ambitious feature that was scaled back was
[`PlaceMap`], where the map once displayed more data on available
communities and modules and where zooms and transitions once took place.
The result is that a much simpler vector map can be written to replace
the original.

### PlacesListForState and PlacesList

Class `PlaceMap` has a commented out section which uses
[`PlacesListForState`] and [`PlacesList`]. Since these are related to
the more in depth features, these classes are deprecated.

### Landmarks Class

In the [`Landmarks`] class, Mapbox Drawtool comments out all controls
but for points. Maybe this is vestigial from a time when Landmarks were
sometimes Polygons. 

### Only Communities

There was once a time when only a few states had statewide modules.
Some states only had local community options for mapping. Since we've
extended statewide modules for every state, places in the code that
conditioned on this possibility is now vestigial.

This is particularly true in [`StateLandingPage.js`], [`PlacesList`],
which is entirely deprecated, in [VRA] mode and `community.js`.

### coi2

While not quite a deprecated feature, the `coi2` mode is only used for
once state, North Carolina. It has its own plugin, `MultiLayersPlugin`,
which has many neat features. It may be that the COI plugins moves more
in this direction. This is also conditioned in [VRA].

### Consolidated HTML files

Speaking of which `community.js`, it is only ever used in
`community.html`. While that was once its own section in the landing
page, it has since been deprecated to the State Landing Pages.

In fact, many html files are no longer necessary. As according to
[`package.json`] many are sent to...
- `edit.html` like...
   - `COI.html`
   - and `plan.html`
- ...or `event.html` like...
   - `tag.html`
   - and `group.html`

### No More Logging In

Originally, like many websites, districtr had an option to register
and log in with authentication. This is no longer needed. As such, the
following...

- views are no longer needed...
   - register.js
   - signin.js
   - signout.js
- ...and api functions are no longer needed...
   - auth.js
   - client.js

For instance, in [index.js], there is still sign in infrastructure 
like the header or `initializeAuthContext`. Without authentication, 
`clearQueriesFromURL()` becomes less important.

### Replaced Functions

Speaking of the `/api/` folder, `places.js` was replaced by `mockApi.js`
as a way to look through modules. This can go. 

`LandmarkTool` is still created in `tools-plugin.js`. When this occurs, 
an object is created with instance methods that interact with the map
but no path exists for them to be updated. It seems like all these
functions were reassigned to `CommunityPlugin`. 

Finally, `my_coi.js` loads a special set of layers when permitted by
the `spatial_abilities`. However, in no case is the relevant `load_coi`
marker ever set true. Thus, it is likely deprecated.

### Hotkeys

Undo and Redo buttons handle recent erasing operations, but hot keys are
still bound only to recent brushing operations. Should hotkeys be
removed or updated?

### Swipemap

While most of the experimental swipemap features have been removed from
production level districtr, there are still features of swiping in
[`Map`] functions.

### PlanContiguity.js

planContiguity.js is no longer used for determining contiguity and
should be removed.

## The Unused

Somtimes, functions are written based off of older functions, patterns
or ideas. However, as the code evolves, this may result in functions, 
variables and imports that are passed but not used.

### Unused Functions

In `StateLandingPage`,...
- `drawTitles(...)` and
- `getProblems(place)`
...are no longer used anywhere.
 
In `utils.js`,...
- `summarize(...)`,
- `dispatchToActions(...)` and 
- `dec2hex(...)`
... are defined and not used. They may be helpful in the
future, but now now.

In reducers, there's a function `bindDispatchToActions(...)` that isn't
used anywhere.

Finally, for [VRA], a special [modal] is written for VRA but is no
longer used.

### Unused Variables

- In the [`Map`] object, `this.mapboxgl` instance variable not used
- `brush` is a parameter passed into the [`NumberMarkers`] function but
isn't used. In the same function, `colorsAffected` is a parameter sent
to the `updated` but doesn't appear passed when the function when it is
called. 
- In the `UIStateStore`, each subscriber in instance variable
`this.subscribers` is called when `dispatch` is called. Each of these
subscribers are sent `this.state` and `this.dispatch`, but only two
subscribers are ever assigned to `store`, in `editor.render`, and
neither use any arguments. This is not the case in the parallel track
taken by `State` objects.
- In [`Histogram`] The `widthMultiplier` is practically redundant as it
modifies hard coded values for income and age histograms. It is always
1.5 and 1 respectively and modifies widths 44 and 2 respectively. Thus
these values could be hard coded 66 and 2 without `widthMultiplier`.
- In [`VRAEffectiveness`], argument `brush` is not used. Furthermore,
generated variable `placeID` is not used. Thus, precident variables
`place` and `extra_source` used aren't needed.

### Unused Imports

Related to the plugins...
- [`CoalitionPivotTable`] is imported in [`CommunityPlugin`] and 
[`EvaluationPlugin`] but is not used.
- [`DemographicsTable`] imported by `data-layers-plugin` but is not
called.
- The [`AgeHistogram`] is imported but not used in muti-layers-plugin

`db` from [`server.js`] is imported but not used in the following files.
Perhaps it is important in creating a connection, so no explicit use
is needed. However, it is never used excplicitly in any case it is
imported including... 
- `eventRead.js`
- `planCreate.js`
- `planPreview.js`
- `planRead.js`
- `planText.js`
- `planUpdate.js`

Finally, wrangling [packages] for npm is its own specialty. While
reviewing the [packages] code, it appears that `caniuse-lite?` and
`encoding` don't appear to be used but may serve some other function,
like as prerequisites.

### Unused Arguments

In [BrushEraseTools] The const that stores the `BrushTool` icon is a
function that takes in parameters, but whose output is never changed.
This must be vestigial from an experiment where we changed the rendered
tool icon based on state.

In [`VRAEffectiveness`], argument `brush` is not used. 

# #

[Return to Main](../README.md)
- Previous: [My Personal Philosophy on Functions](../11suggestions/philosophy.md)
- Next: [Clarifying Operations](../11suggestions/clarity.md)
- [Logical Redundancies](../11suggestions/logic.md)
- [Organization](../11suggestions/organizing.md)
- [The Heavy Lift: (Not) Global Objects](../11suggestions/globalobjects.md)
- [Other Notes](../11suggestions/other.md)

## Special Cases

The `routes` object has identical keys and values makes it appear
redundant. What is the advantage of this structure?

[`Map`]: ../02editormap/map.md
[`NumberMarkers`]: ../02editormap/numbermarkers.md

[BrushEraseTools]: ../03toolsplugins/brusherasetools.md
[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[modal]: ../03toolsplugins/modal.md

[`PlacesListForState`]: ../05landmarks/findplaces.md
[`mockApi.js`]: ../05landmarks/findplaces.md
[`LandmarkTool`]: ../05landmarks/landmarktool.md
[`my_coi.js`]: ../05landmarks/mycoi.md
[`CommunityPlugin`]: ../05landmarks/communityplugin.md
[`Landmarks`]: ../05landmarks/landmarksclass.md

[`PlaceMap`]: ../07pages/placemap.md
[`PlacesList`]: ../07pages/placemap.md
[`StateLandingPage.js`]: ../07pages/districtrstatepages.md
[`StateLandingPage`]: ../07pages/districtrstatepages.md

[`CoalitionPivotTable`]: ../06charts/datatable.md
[`EvaluationPlugin`]: ../06charts/evaluationplugin.md
[`DemographicsTable`]: ../06charts/datatable.md
[VRA]: ../06charts/vra.md
[`Histogram`]: ../06charts/histogram.md
[`VRAEffectiveness`]: ../06charts/vra.md
[`AgeHistogramTable`]: ../06charts/demographicstable.md

[packages]: ../09deployment/package.md
[`package.json`]: ../09deployment/package.md
[`server.js`]: ../09deployment/mongolambdas.md

[`utils.js`]: ../10spatialabilities/utils.md


# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA

