# Logical Redundancies

Since early features serve as templates for future features, new
features often retain pieces of logic that never apply because such
logic was already conditioned further upstream. This is logical
redundancy and clogs up the code. 

In a similar fashion, identical if statements condition separately and
can be consolidated. We explore the logic of districtr as we consider
these suggestions. 

There are three large questions that determine the final look and data
of a districtr [Editor].

- The [`problem`] mode, [`coi`] or default
- The Place of a module
- The State of the module. 
  - ...and maybe its [Event]

Thus, there should only be one place each the logic should be held. 

## The Problem Mode

Throughout the many plugins and components, we often test if the current
problem is [`coi`] or not to determine their behavior. But this logic is
often never required because the big fork in the road is the
[`ToolsPlugin`]. This plugin already determines which plugins to load
based on problem mode. 

> `ToolsPlugin` is so important, that it is always loaded. We could even
renamed it `PluginManager` or something to highlight its importance.

It's not a clean break however as different plugins could apply to both
coi and regular modes, and logic must then be spent there. Some
reengineering should split apart plugins only used each for `coi`,
`default` or even `vra` mode.

> Often, the only difference between `default` and `coi` mode are the
labes, "districts.." vs "communities...!"

Without even major changes, we see that the constant checking of `coi`
creates more logical cracks we can slip through. For instance,
[`PopBalancePlugin`] and the [`EvaluationPlugin`] condition on 
`community`, but are never called by `ToolsPlugin` when we're in 
community mode! Other examples include...

### The Tools Plugin

Before the [`ToolsPlugin`] even conditions [plugins] on `problem.type`,
it decides and populates either a regular or community [`Brush`]. 
This brush is passed in `brushOptions`, one of which is a reminder
whether the `problem.type` is community or not. This is redundant
as only default modes make `Brush`es and only community modes make
`CommunityBrush`es. This is repeated in `Brush` as many conditions
within `Brush` depend on `community` mode rather than letting its
descendent `CommunityBrush` handle it.

> [`BrushTool`] should manage the creation of `Brush` away from the
Tools Plugin.

Afterwards, we condition again whether we need a [`ContiguityChecker`],
which [VRA] and [community] modes don't require. 

> If `ContiguityChecker` only applies in default, it should be managed
by a default only plugin. 

Condition `showVRA` is also asked for when creating `VRAEffectiveness`.
I believe that this function is only used to create a connection to
AWS? Otherwise it isn't called. Any VRA functions should be folded into
its own mode and plugin.

It is also asked again in `getMenuItems(...)` but is never used. 

A complete list of `coi` conditions is found in [chapter 05] and
`VRA` features are found in [chapter 06]

## Permissions by Module

Each module must juggle its own unique fingerprint of relevant
[`Layer`]s, features and permissions. Much of this is described in
[spatial_abilities], but [Spatial Exceptions] lists even more place
specific excpetions. To scrub away the hard code, I recommend we build
`spatial_abilities` out to cover all possible exceptions by place. 

### Find Places

A great example of where a better `spatial_abilities` could simplify
code is by considering [`findPlaces.js`], responsible for finding and
matching modules. This is a lot of work. This function also relies on
older functions like `lookupState` from `lookupOldState.js` which is
supposed to match module to state but is never updated when new modules
are added.

The next closest thing to a master module list is `spatial_abilites`
which is easier to work with than traversing files. 

### Data Layers Plugin

The bulk of [`DataLayersPlugin`] is navigating hard coded rules on
module layers. A strong `spatial_abilities` could help simplify both
this and ['DataSetInfo`].

For instance, in the `DataLayersPlugin`, `showVRA` is guaranteed to add
a County Layer to the map. However, VRA data is (for now) only available
for states, making this addition redundant.

As a result of this copy and pasting, you'll find that layers loaded
for `va` may have an id `lax` that is now hard-coded rather than
dynamically generated.

A full set of Place Exceptions can be found in [Chapter 10].

## Other Conditions

### [Number Markers]

We plot Number Markers based off centroids calcualted from current
painted districts. This is acheived by querying the Python Anywhere
server with a GET function.

- GET functions can only process up to 100 district when generating
district centroids. A simple, though not uniform way, to select 100
random objects in a list is through taking a slice of
`[...array].sort(() => 0.5 - Math.random());`

- This was once important because we would batch collect centroids

> This collection of centroids should be placed `routes.js` for
consistency's sake.

### Brush

`Brush` is responsbile for checking the `color` of a feature but asks
separately if that `color` is null or undefined or `isNan(...)`. These
functions are equivalent statements and only one of these conditions
are needed.

> Ideally, feature colors are initialized to Null and not 0 or
`undefineared` or anything else. Much effort is also expended to ensure
that colors (i.e. indexes) are `Number`s, effort better spent ensuring
that colors are only saved as a `Number`.
 
In the same object, a condition is written as `part !=== null?`. This is
equivalent to `part?` as a null result is interpreted as `false`. 

## Repeated Conditions

### [ColumnSet] Parts

In function `getColumnSets(...)`, if statements check each type of
columnset, like `if (state.vap)` twice. Could this condition be folded
into itself so that it is called once?

ColumnSet even hard codes all possible columnsets with attendant
functions, which could be redesigned to be more dynamic.

> What's the difference between `state.columns` and the `ColumnSets`
array?

### [Histogram]

There are eight places where `isAge` is tested in Histogram. 

### ma_towns

As the oldest modules, many cases depend upon the presence of `ma_towns`
rather than refering to `spatial_abilities`. Often, the resulting
boolean is never used.

For instance, The Reveal Section on "VRA Effectiveness" conditions
against using `ma_towns`, yet there should be no case where `ma_towns`
is used with showVRA as it is not included in the portal. Thus, this is
redundant logic.

## More...

- Both `indiciesOfMajorSubgroups()` and `RacialBalanceTable` hard codes
a special case for 2018 and 2019 data. Could this be consolidated?

- In the [Evaluation Plugin] two equivalent if statements
`state.elections.length > 0` should be combined.

- In `PlacesList`, it seenms redundant to filter the results again by
state in `_placesCache`? 

# #

[Return to Main](../README.md)
- [My Personal Philosophy on Functions](../11suggestions/philosophy.md)
- [Deprecations and Experimental Features](../11suggestions/deprecations.md)
- Previous: [Clarifying Operations](../11suggestions/clarity.md)
- Next: [Organization](../11suggestions/organizing.md)
- [The Heavy Lift: (Not) Global Objects](../11suggestions/globalobjects.md)
- [Other Notes](../11suggestions/other.md)

[`problem`]: ../01contextplan/plancontext.md

[Editor]: ../02editormap/editor.md
[`Layer`]: ../02editormap/layer.md
[Number Markers]: ../02editormap/numbermarkers.md

[plugins]: ../03toolsplugins/plugins.md
[`BrushTool`]: ../03toolsplugins/brusherasetools.md
[`ToolsPlugin`]: ../03toolsplugins/toolsplugin.md

[`CommunityBrush`]: ../04drawing/brush.md
[`ContiguityChecker`]: ../04drawing/contiguity.md
[`Brush`]: ../04drawing/brush.md

[community]: ../05landmarks/coi.md
[chapter 05]: ../05landmarks/coi.md
[`VRA`]:  ../06charts/vra.md
[`findPlaces.js`]: ../05landmarks/findplaces.md
[`coi`]: ../05landmarks/coi.md

 
[`PopBalancePlugin`]: ../06charts/popbalanceplugin.md
[`EvaluationPlugin`]: ../06charts/evaluationplugin.md
[ColumnSet]: ../06charts/columnsetsparts.md
[Histogram]: ../06charts/histogram.md
[VRA]: ../06charts/vra.md
[Histogram]: ../06charts/histogram.md
[`DataLayersPlugin`]: ../06charts/datalayersplugin.md
[chapter 06]: ../06charts/vra.md
['DataSetInfo`]: ../06charts/datasetinfo.md

[Event]: ../08events/event.md

[Spatial Exceptions]:  ../10spatialabilities/placeexceptions.md 
[Chapter 10]: ../10spatialabilities/placeexceptions.md
[spatial_abilities]: ../10spatialabilities/spatialabilities.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA


