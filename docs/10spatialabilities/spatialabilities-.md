# Spatial Abilities

Within `utis.js` is a large object known as `spatial_abilities`
which is used throughout districtr to permit certain features
based on place. There are about 110 or so modules available,
at least for one state, alternative modules for each state and 
many more for specific counties, and cities that we work with or
have requested a module. 

A list of these features can be reviewed at
[districtr.org/html/features.html] created by [@jdeschler]. 

## Nearly universal features 

- `find_unpainted` and `zoom_to_unassigned` were once
permitted ability, but are now standard features.
- `number_markers` is nearly completely standard except for
`lavra`
- `shapefile` permits the downloading of shapefiles. This permitted
for over 90% of modules.
- `load_coi`, which defaults to true, is set to false for only
about nine modules.
- `coalition`, the ability to create coalitions of different
races for analysis and defaults to true, is disallowed for about
four modules.

## Common features

- `native_american`, which gives the option to display tribal areas,
is available to mostly states but not local places
- `county_brush`, similar to above, is available to most states except
for New England, where counties are perfunctory
- `multiyear` signifies the availability of 2018 or 2019 ACS data, is
available to about 30 modules.
- `portal` provides an endpoint to the districtr app different from
districtr.org itself. It is provided when we partner with organizations.
This is the case for about two-dozen modules. 


## Rare Features

- `contiguity`, which permits the user to check for discontiguous areas,
is available for only about two dozen modules. 
- `current_districts`, which permits the display of current district
boundaries is only available for about eight modules
- `school_districts`, which permits the ability to display special
school boundaries, is only available for eight or so places
- `municipalities`, which permit the user to display local cities,
is only available for about four places.z
- `parties`, for local, parimary or Puerto Rican elections, parties
different than standard Democrat and Republican must be denoted.
- `border` indicates a city limits layer available to some municipalities,
- `sideload` indicates the need to fetch even larger amounts of data
for about five lrge states.

# #

### Suggestions

- This special object should be made into its own file to highlight
its importance.
- A comprehensive listing of available features coul also live in that new
file.
