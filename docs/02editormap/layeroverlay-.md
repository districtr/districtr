# Overlays 

Used in Multi and Data Layers plugin


## Overlay 

`Overlay` class is collection of `Layer`s

- `this.layers`
- `this._currentLayerIndex`
- `this.colorRule`
- `this.visible`

Bound Functions

- `currentLayer()`
- `setSubgroup(subgroup)`
- `setColorRule(colorRule)`
- `show()`
- `hide()`
- `repaint()`

Helper Function `createLayer`

## Overlay Container

this._id = id;
this._currentSubgroupIndex = firstOnly ? 1 : 0;
this.subgroups = columnSet.columns;
this.firstOnly = firstOnly || false;
this.multiYear = multiYear;
this.yr = 2010;

if includecoalition
if multiyear

colorrule

changeSubgroup
selectyear

Renders

Parameter with subgroups
- Maybe MultiYear
- Gradient Bar

layer display names, get Layer Description

## Partisan Overlay Container

Related to PartisanOverlay

Renders

Checkbox, is visible, show partisan lean
Alernate, absnetee



_Can it extend Overlay?_

Overlay Containers
An Overlay Container provides the user the option to plot information directly on the map. Two OverlayContainers can be created corresponding to Demographics, and if present, VAP or CVAP. These are loaded into new Reveal Section tab.addRevealSection("Race"...) which is default to stay open on load.

If present as state.median_income or state.rent, median income and perecent renters can also be depicted as Overlay Containers under Reveal Section "Socioeconomic data." As a scalar value, Median Income can be represented as a simple Overlay Container. Rental percentage, on the other hand, is a proportion, which we model similar to elections. Thus, a new Election object is created from rental precentage data and a PartisanOverlayLayer is used to depict this data. When rendered in the document, a green-orange bar indicating percent functions as a legend.

Eletions
Finally, if there exists state.elections, a new reveal section is created titled "Previous Elections." The contents of state.elections is sent to PartisanOverlayContainer, which is responsible for depicting a radio list of available elections and depicting them in the map. This section is open to the user by default.
