# Deprecations

As districtr has grown, many new features have been tried. Many have
stuck, but as the program has evolved, the code still retains old lines
of features that have been replaced.

## PlacesMap

A classic example of a more ambitious feature that was scaled back was
`PlaceMap`, where the map once displayed more data on available
communities and modules and where zooms and transitions once took place.

The result is that a much simpler vector map can be written.

### PlacesListForState and PlacesList

Class `PlaceMap` has a commented out section which uses
`PlacesListForState` and `PlacesList`. Since these are related to the
more in depth features, these classes are deprecated.

## Only Communities

There was once a time when only a few states had statewide modules.
Some states only had local community options for mapping. Since we've
extended statewide modules for every state, places in the code that
conditioned on this possibility is now vestigial.

This is particularly true in `StateLandingPage.js`, `PlacesList`, which
is entirely deprecated, and `community.js`.

## coi2

While not quite a deprecated feature, the `coi2` mode is only used for
once state, North Carolina. It has its own plugin, `MultiLayersPlugin`,
which has many neat features. It may be that the COI plugins moves more
in this direction. 

## Consolidated HTML files

Speaking of which `community.js`, it is only ever used in
`community.html`. While that was once its own section in the landing
page, it has since been deprecated to the State Landing Pages.

In fact, many html files are no longer necessary. As according to
`package.json` many are sent to...
- `edit.html` like...
   - `COI.html`
   - and `plan.html`
- ...or `event.html` like...
   - `tag.html`
   - and `group.html`

## No More Logging In

Originally, like many websites, districtr had an option to register
and log in with authentication. This is no longer needed. As such, the following...

- views are no longer needed...
   - register.js
   - signin.js
   - signout.js
- ...and api functions are no longer needed...
   - auth.js
   - client.js

## Replaced Functions

Speaking of the `/api/` folder, `places.js` was replaced
by `mockApi.js` as a way to look through modules. This
can go. 

`LandmarkTool` is still created in `tools-plugin.js`. When this occurs, 
an object is created with instance methods that interact with the map
but no path exists for them to be updated. It seems like all these
functions were reassigned to `CommunityPlugin`. For more details, visit
`LandmarkTool`. 

Finally, `my_coi.js` loads a special set of layers when permitted by
the `spatial_abilities`. However, in no case is the relevant `load_coi`
marker ever set true. Thus, it is likely deprecated.

### Unused Functions

In `StateLandingPage`,...
- drawTitles(...) and
- `getProblems(place)`
...are no longer used anywhere.

In `utils.js`,...
- `summarize(...)`,
- `dispatchToActions(...)` and 
- `dec2hex(...)`
... are defined and not used. They may be helpful in the
future, but now now.

## Unused Variables

- In the `Map` object, `this.mapboxgl` instance variable not used
- `brush` is a parameter passed into the `NumberMarkers` function but
isn't used. 
- In the `UIStateStore`, each subscriber in instance variable
`this.subscribers` is called when `dispatch` is called. Each of these
subscribers are sent `this.state` and `this.dispatch`, but only two
subscribers are ever assigned to `store`, in `editor.render`, and
neither use any arguments. This is not the case in the parallel track
taken by `State` objects.


- NumberMarkers
- `colorsAffected` is a parameter sent to the `updated` but doesn't
appear passed when into the function when it is called. 

## Unused Imports

- `CoalitionPivotTable` is called in `CommunityPlugin` and
`EvaluationPlugin` but is not used. 

### Mongo Lambdas
`db` from `server.js` is imported but not used in the following files.
Perhaps it is important in creating a connection, so no explicit use
is needed. However, it is never used excplicitly in any case it is
imported including... 
- `eventRead.js`
- `planCreate.js`
- `planPreview.js`
- `planRead.js`
- `planText.js`
- `planUpdate.js`


### BrushEraseTools
- The const that stores the `BrushTool` icon is a function that takes in parameters, but
whose output is never changed. This must be vestigial from an experiment where we changed
the rendered tool icon based on state.

### Landmarks Class

- Do we draw Polygon landmarks anymore? Mapbox Drawtool comments out all controls
but for points. Maybe this is vestigial. 
- The `PopBalancePlugin` and the `EvaluationPlugin` both have conditions on `community`
but is not part of the plugins created in Community mode

### COI
- The `PopBalancePlugin` and the `EvaluationPlugin` both have conditions on `community`
but is not part of the plugins created in Community mode

### COI

- While it's good to have `CommuntityBrush` extends `Brush`, `Brush` still has a few
conditions that rest upon `community`, which are now never called.

### Demographics Table
- `DemographicsTable` imported by `data-layers-plugin` but is not called. 


### DataTable

- `CoalitionPivotTable` is called in `CommunityPlugin` and
`EvaluationPlugin` but is not used. It is created only once in
`DataLayersPlugin`


- The `AgeHistogram` is called but not used in muti-layers-plugin

## Histogram
- The `widthMultiplier` is practically redundant as it modifies hard
coded values for income and age histograms. It is always 1.5 and 1
respectively and modifies widths 44 and 2 respectively. Thus these
values could be hard coded 66 and 2 without `widthMultiplier`.

### VRA

- In `StateLandingPage.js`, vra mode is unique in calling multiple
states. Places for each state are generated using `listPlacesForState(...)`,
and in this function, `show_just_communities` is set against its default
to `true`. This suggests that we always use the `communitiesFilter` in
`PlacesList.js`. This filter, however, only applies when `renderNewPlanView()`
in deprecated `community.js` is called. Thus, it is not needed. 

- Reminder for later, in `PlacesList`, isn't it redundant to filter again
by state in `_placesCache`? 
- Reminder for later, it seems that `onlyCommunityMode` in `StateLandingPage.js`
is deprecated
- Reminder that `coi2` is practically deprecated

- In `tools-plugin.js`, `showVRA` is determined but not used by function `getMenuItems(...)`


- In `VRAEffectiveness`, argument `brush` is not used and `placeID` and therefore `place`
and `extra_source` is not used.


- In `DataLayersPlugin`, `showVRA` is guaranteed to add a County Layer to the map.
However, VRA data is only available for states, making this addition redundant.


- The Reveal Section on "VRA Effectiveness" conditions against using `ma_towns`, 
yet there should be no case where `ma_towns` is used with showVRA as it is not
included in the portal. Thus, this is redundant logic.

- A special modal is written for VRA but is never used 

### Index

It is vestigial to have a sign in header or `initializeAuthContext`, which makes
`clearQueriesFromURL()` less important.


### Package
Wrangling packages for npm is its own specialty. While reviewing the code,
it appears that `caniuse-lite?` and `encoding` don't appear to be used
but may serve some other function, like as prerequisites. 

### Routes
- The `routes` object has identical keys and values making it redundant.
What is the advantage of this structure?


### Suggestions 
- The const that stores the `BrushTool` icon is a function that takes in
parameters, but whose output is never changed. This must be vestigial
from an experiment where we changed the rendered tool icon based on
state.
- We should go ahead and set a default value for the `renderToolbar`
parameter in `BrushToolOptions`, as it is always set to `undefined` when
it is called. In fact, it is called in each of the `BrushToolOptions`'
instance methods and is ultimately set to re-render the Editor when the `BrushTool` is added by to the
`Toolbar` by the `addTool(...)` function. 
- Undo and Redo buttons handle recent erasing operations, but hot keys are still bound only
to recent brushing operations. 
