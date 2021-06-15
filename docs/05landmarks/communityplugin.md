# Community Plugin

The `CommunityPlugin`, found in `/src/plugins/community-plugin.js`,
is vital to the drawing and editing of landmarks and replaces the
`PopBalancePlugin` used when drawing districts as the first tab in the toolbar.

When this plugin is loaded, it is titled  "Drawing"  and includes
two reveal sections, "Areas of Interest", painted districts that act
as a community, and "Important Places", point based landmarks. 

This tab was born on Wed., Apr. 24, 2019 and filled out over time
by [@maxhully]. It is maintained by [@mapmeld] with VRA functionality
by [@jenni-niels]. 

## Construction

The Community Plugin is designated early in a list of plugins in `edit.js`
and created when the `Editor` is initialized. It requires only the `Editor`
as an argument and from there, uses its instance `state` and `mapState`. 

The `Tab` added to the `Toolbar` is titled "Drawing" and reveal sections
"Areas of Interest" and "Important Features" are loaded here.

Part of this construction is the creation of `lm`, a list of
landmarks from `state.place.landmarks` and `lmo`, a list of landmark
options. If needed, we create an empty `lm`, an object with `type` "geojson" and
`data`, an object of type `FeatureCollection` and an empty array of
`features`.

> Some work is used to ensure backwards compatibiility with older
style landmark lists. 

If there is no `state.map.landmarks`, then we create a new `Landmarks`
object passing in `state.map`, `lm` and an anonymous `addFeature` function.

A new `LandmarkOptions` object is also created with landmarks, features
and the `State` map. 

### The Add New Feature Function for Landmarks

When a new landmark feature is created, this anonymous function is called
that saves the current state to storage. If any number of `lm.data.feature`
exist, element of id `#landmark-instruction` is ensured visibility.

If a new feature is indeed created, `window.selectLandmarkFeature` is set
to the last in the `lm.data.features` list and element of classes `.landmark-select`
and `.marker-form` are set to defaults based on the sequential number of the new
feature and a blank description is set to save the new feature.

Otherwise, last feature in the list is set as the selected feature. After this,
the whole `state` is rerendered, that is, all subscribers of `state` are called. 

_loc_array[loc_array.length - 1] keeps you from having to create window.selectLandmarkFeature?_

_ Only ever called as new_

## A Custom Evaluation Tab

_ OMG WHY????_ 

While there exists clean ways to write custom tabs, unusual among all plugins, 
the `CommunityPlugin` implements to `Tab`s in the `Toolbar`, the `Drawing` tab
and a custom `Evaluation` tab that implements a Population `PivotTable`, a 
VAP `PivotTable` if `state.vap` is available, a `MedianIncomeTable` if `state.incomes`
is available and likewise, a `DemographicsTable` on renters.

_hard coding for Arizona, gahh!_

_ state.map is the same as mapState.map_

_ addFeatureFunction should be a helper!_

### Adding Location Search

To help users find locations, a gazeteer search bar is included in the top
of the mapbox-gl map. This requires the fetch of the official mapbox geocoder,
its restriction to current canvas bounds and its creation in the `mapBox` mapbox-gl
`map` container. The `addLocationSearch(mapState)` function that accomplishes
this is called early in the call of the first `addMapState` function. 

# Class LandmarkOptions

A new `LandmarkOptions` class, completely different from 
`LandmarkOptions` in Landmark.js, is used to allow the editing of feature
properties. It takes a list of `landmarks`, `features` and the `map` to
create instance variables `this.points`, `this.drawTool`, `this.features`,
`this.map` and `this.updateLandmarksList`. All of the following helper functions
are bound to this instance.

_Garrrrh! What's the deal with Landmark Options twice?_

## Instance Functions

For every feature, one can `setName(name)`, `setDescription(description)` and
save or delete a feature. Additional callback `onDelete()` is written so that
together with `deleteFeature(delete_id)`, the feature is removed from both area and
point `Layer`'s geometries.

_onDelete and DeleteFeature, can it be combined?_

## Rendering

`LandmarkOptions` also allows user elements to be rendered in the Important Places
reveal section. There are roughly three parts to this section, which all interact
with each other using `onClick` event callbacks.

### New Button

The new button is used to create new point landmarks. 

Wben the new Button is clicked...
-the `window.selectLandmarkFeature` is reset to -1 to let the plugin know
we're creating a new Landmark
- the current `Tool` is set to Pan
- The marker name and description form is hidden, but not the dropdown
list of landmarks
- Landmark instructions are shown
- The mapbox drawpoint is used as the mouse by intracting with the `LandmarkTool`

_Cannot cancel the creation of new landmark, only create and delete_

### Selecting Landmarks

### Place Name and Description

_Callbacks and Helpers please!_
