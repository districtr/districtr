# The Place Map

The Place Map is featured on some pages as a map of the United States that
allows users to navigate to State Landing Pages. It is a rendered vector map
with insets for Hawaii, Alaska, DC and Puerto Rico. It once had rich data
display features but much of that is vestigial. Currently, it only allows users
to highlight a state and on click, navigate to that state's landing page. 

## `PlaceMapWithData` and `PlaceMap` 

When called externally by `community.js`, `new.js` or `index.js`, `PlaceMapWithData()`
is usually called. Originally, this function would parse out a specific postal-code
from the window address. This `selectedId` is now deprecated and `PlaceMap` now only
contributes a dropdown form select id `#place-search` within div class `.place-map__form`
that allows users to select their preferred state and updates on the hover of a map. 

The actual rendering and hovering of svg features is done when the `fetcheFeatures(...)` is called,
which collects features from `/assets/simple_states.json`  and are sent to `Features(...)`.

## `Features(features, onHover, selectedId)`

Many for local communities, no more. Also category for available, no more.

One by one each feature, using geoAlbersUsaTerritories path

DC gets annotation and altpath

PR gets alt path

Colored thanks to css state-available on hover


# #

### Suggestions 

So much is deprecated from the days when local communities were either displayed, then listed, then 
sent straight to state landing page. 

