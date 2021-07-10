# Events

When partnering with state and local organizations, we often organize
submitted plans using event codes. An event code is usually a simple
piece of metadata attached to plans when they're saved that allows them
to be queried together in a database. These were originally created
by [@jenni-niels] and are currently the purview of [@mapmeld] and
[@AtlasCommaJ] with help from the whole team.

## Navigation

In general, event pages are navigated to using
http://districtr.org/event/plugin-name

## [`districtr/src/views/event.js`]

According to [`package.json`], url directed to `tag.html`, `group.html`
and `event.html` are sent to `event.html` which is populated by
`event.js`. This javascript file contains event specific settings and
event codes.

- `stateForEvent`, ties together event code and their relevant state
- `validEventCodes`, a full list of event codes in use
- `blockPlans`, specific codes for "powercoalition" 
- `unitTypes`, sets limits on appropriate units for the plans of some
events
- `unitCounts`, counts the number of units for the plans of some events
- `coi_events`, event codes that collect communities of interest
- `hybrid_events`, events that collect both cois and district plans
- `eventDescriptions`, descriptions and other html meant for specific
event pages
- `longAbout`, more detailed descriptions for certain events
- `proposals_by_event`, boolean if proposed plans have been prepared.

### Default Rendering

The primary responsiblity of `event.js` is to fill out the html elements
provided by `event.html`. After checking whether an event code is
valid...

- We fill out element id `eventHeadline`
- provide special codes if in `coi_events`
- provide partnership information if specific to `mesaaz` event
- generate a mini-map if specific to Ohio `open-maps`event
- display or hide elements if part of `validEventCodes`
- create list items for available plans and places for a given event
- display a list of submitted plans generated from `event`

The main event occurs when we query the database for plans that belong
to a specific `eventcode`. Then, internal function `showplans(...)` is
called which renders the collection of plans using helper function
`plansSection(...)` which in turn renders each plan using a format
specified by `loadablePlan(...)`.

Sometimes, event specific graphics and perhaps sample or professional
plans are loaded in from the `assets` folder.

# #

### Suggestions

An object model should be made for each event that stores specific links
and materials rather than hard coding different fields for many events.

# # 

[Return to Main](../README.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@jenni-niels]: http://github.com/jenni-niels


[`package.json`]: ../09deployment/package.md
[`districtr/src/views/event.js`]: ../../districtr/src/views/event.js

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA