# Communities of Interest

Districtr has two primary modes, one sometimes known as `"districtview"`
where districts are painted and calculated and `"community"` mode, where
an unspecified number communities and landmarks can be identified. This
functionality was introduced because some states have laws that seek
to consider communities of interest while redistricting. 

The Communities mode differs from the plain Districting mode because
the number of communities you draw might be dynamic vs static, the
communities you create can be named or described and [landmarks] can
be drawn, named and described. Thus, districtr dons a different outfit
when in `"community"` mode by deploying different plugins.

Simply, the [`ToolsPlugin`] and the [`DataLayersPlugin`] are the same
for both modes. The [`PopulationBalancePlugin`] and the
[`EvaluationPlugin`] is reserved only for districting mode and the 
[`CommunityPlugin`] is reserved for COI use. 

[@maxhully] first built out a protype `Landmarks` feature in February of
2019. By late April, the painting of communities of interest was
achieved. It is thanks to [@jenni-niels] that state pages for marking
communities of interest were generated later that year. They have
maintained this page with [@mapmeld] through 2020 up to the present day.

## Loading through the [State Portal]

Just as every state or place have certain modules that allow districts
of specific numbers to be drawn out of units, (i.e. block groups or
precincts), statewide, city or regional communities can also be built
out of the same unis. 

The state portal first responsibility is to `drawPage(...)`, which
builds the overarching framework of a districtr portal page like
navigation, headers, footers and any sections provided by function
`drawSection(...)`. 

Next, `districtingOptions(...)` and, most relevant to COIs,
`communityOptions(places)` are plotted. The are the buttons that will
eventually navigate the user to the editor. Function
`communityOptions(places)` uses `placeItemsTemplateCommunities(...)`
function and it is here where new plans are sent the `problem` object
that will identify to the editor that we are plotting communities of
interest.

```
problem = { type: "community", numberOfParts: 50, pluralNoun: "Community" };
```

### Routes

Starting new plans is acheived through the `startNewPlan(...)` function
in [`routes.js`]. Since our problem is set to `community`, we navigate
to "COI", essentially `coi.html`, which itself is an alias to
`edit.html`. Remember, all roads lead to edit.html and [`edit.js`],
which itself checks if the problem is `community` and proceeds to load
the proper plugins. 

### Vestiges

Both `community.html` and `community.js` was once separate from the
districting functions of districtr but have been folded into the
mainline `edit.html` and `edit.js` files.

## Loading an Editor for COIs

As stated in `edit.js`, the following plugins are loaded when Loading
Plugins. 

- [`ToolsPlugin`]
- [`DataLayersPlugin`]
- [`CommunityPlugin`]

Also note that communities of interest use a different mapbox baselayer
than regular communities.

### State object

The [`state`] object keeps track of the context/plan as it is being
edited. There are several ways that it keeps track of communities and
landmarks. 

First, within subclass `DistrictingPlan`, accessed in `state.plan`,
space is made in the `place` object for `landmarks` which will be
appended as the user labels important places. 

Then, as `state.parts` typically keeps track of districts, in
communities mode,  it keeps track of COIs and gives them a sequential,
default, name, "Community 1", "Community 2", etc.

Finally, when we initialize the `mapState`, we plot our communities with
`addbelowLabels` rather than `addBelowSymbols` with regular districts.

## ToolsPlugin and Toolbar

Now that we are building out the [`Toolbar`], we notice a few more
changes for coi editing versus districting editing.

- The `brush` used by tools is now the [`CommunityBrush`], rather than
standard `Brush`
- A new [`LandmarkTool(state)`] is created 
- Community mode is reinforced redundantly in `brushOptions` 
- There is no [contiguity checker] for communities
- Among the [menu items], we replace the labels to reflect community
mode 
- The labels in the [Modal] must also reflect community mode.

## Data Layers Plugin

The [`DataLayersPlugin`] is used for both regular districting mode and
COI mode. Thus, `community` must be conditioned upon throughout the
plugin. The `DataLatersPlugin` is also a behemoth that selects different
layers based on different places. [Chapter 10] explains this in more
detail.

- First, labels must be switched to display "community" or 
communities." 
- Certain modules are designed only for local communities. The plugin
selects different layers, sections and option based on these modules.
   - `miamifl`, `miamidade`, `lax`, `lowell` all contain the option to 
suggest neighborhood names.
   - a `load_coi` option is built out, but no place is permitted to
 do so by `spatial_abilities`. It is only explicitly stated false by
 CO and CT.
 
## The `CommunityPlugin`, the Main Event!

The [`CommunityPlugin`]replaces the [`PopulationBalancePlugin`] used by
normal districting and replaces that as the plugin that creates a tab
titled "Drawing".

### Pivot and Coalition Pivot Tables

[`PivotTables`] are only used by themselves within the
`CommunityPlugin`. Most commonly, they are used as part of a
[`CoalitionPivotTable`], which is used both in both districting and
community modes. In that construction, its label must be modified based
whether on COI or district modes.

## Other places where Communities are conditioned

- In both [`PlacesList.js`] and [`PlaceMap.js`], communities once
featured more prominently, especially before all states had statewide
maps. Today, communities now remain only as vestigial features. 
- When updating a [`Subgroup`], special behaviors apply since one can
draw overlapping communities.
- We can filter for only `community` based modules and plans when using
[netlify lambda functions] `moduleRead.js`, `planText.js` and
`moduleRead.js`. 

# #

### Suggestions

- The `PopBalancePlugin` and the `EvaluationPlugin` both have conditions
on `community` but is not part of the plugins created in Community mode
- Within State Pages, `onlyCommunityMode` used to exist for places
where we didn't have state-wide maps. This is now vestigial. 
- While it's good to have `CommuntityBrush` extends `Brush`, `Brush`
still has a few conditions that rest upon `community`, which are now
never called. 
- Most ways COI mode is conditioned upon is for simple labels. Maybe we
could create a simple labels object and condition only once. 
- When one pushes the Important Places "Create" button, its mode cannot
be cancelled until a new landmark is added, which can be deleted right
after. 
- `coi2` is a form of Community of Interest mode that is used very
rarely and may not be needed. 
- `PlacesList.js` and `PlaceMap.js` are mostly vesitigial

# # 

[Return to Main](../README.md)
- Next: [The Landmark Class](../05landmarks/landmarksclass.md)
- [The Community Plugin](../05landmarks/communityplugin.md)
- [The Old Landmark Tool](../05landmarks/landmarktool.md)
- [My COI](../05landmarks/mycoi.md)
- [Finding Places](../05landmarks/findplaces.md)

[@maxhully]: http://github.com/maxhully
[@jenni-niels]: http://github.com/jenni-niels
[@mapmeld]: http://github.com/mapmeld

[`state`]: ../01contextplan/state.md

[`edit.js`]: ../02editormap/editor.md

[`ToolsPlugin`]: ../03toolsplugins/toolsplugin.md
[`Toolbar`]: ../03toolsplugins/toolbar.md
[`CommunityBrush`]: ../03toolsplugins/brusherasetools.md
[menu items]: ../03toolsplugins/topmenu.md
[Modal]: ../03toolsplugins/modal.md

[contiguity checker]: ../04drawing/contiguity.md

[`CommunityBalancePlugin`]: ../05landmarks/communityplugin.md
[`CommunityPlugin`]: ../05landmarks/communityplugin.md
[landmarks]: ../05landmarks/landmarksclass.md 
[`LandmarkTool(state)`]: ../05landmarks/landmarktool.md

[`DataLayersPlugin`]: ../06charts/datalayersplugin.md
[`PopulationBalancePlugin`]: ../06charts/popbalanceplugin.md
[`EvaluationPlugin`]: ../06charts/evaluationplugin.md
[`PivotTables`]: ../06charts/datatable.md
[`CoalitionPivotTable`]: ../06charts/datatable.md
[`Subgroup`]: ../06charts/columnsetsparts.md

[State Portal]: ../07pages/districtrstatepages.md
[`PlacesList.js`]: ../07pages/placemap.md
[`PlaceMap.js`]: ../07pages/placemap.md

[`routes.js`]: ../09deployment/routes.md
[netlify lambda functions]: ../09deployment/mongolambdas.md
[Chapter 10]: ../10spatialabilities/placeexceptions.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA