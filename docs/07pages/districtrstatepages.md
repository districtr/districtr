# Districtr State Pages

On the splash page, `index.html` users can use the US map rendered by
the [`PlaceMap.js`] component to the many state pages districtr provides
as a portal for editing. Originally, MGGG only provided state
information for those states where we had partners before rolling it out
to all states in the nation. 

This documentation covers pages that navigate to different states on
the districtr website as opposed to custom portals for state commissions
and other partners. 

<img src="../pics/pagesbasics.png" width=75%>

## state.html

The link provided in the US state map helps users navigate to a url of
form `/state/`. In [`deploy/_redirects`], this url is sent to a page of
form `state.html`.

For instance, selecting the state of Alabama in the index page sends us
to `districtr.com/alabama` which loads `/html/alabama.html`. Each
state html document starts from the very top, with `<html>`, renders
a full head with id set to the state, say `<head id="Alabama">`
and a body with a standard header class `.site-header` and nav of 
class `.site-nav` that will eventually render a top-bar navigation for
the rest of the page.

The big action takes place in the main section of id `#root` and class
`place`, with an artcle class `.place__content`. It is now the 
responsibility of the linked [`stateLandingPage.js`] to provide content.

## [`src/views/stateLandingPage.js`]

It is thanks to [@jenni-niels] that landing pages for all states
premiered on, Wed. Sept 16, 2020. With their help, district and custom
state portals are maintained by [@AtlasCommaJ] with help from
[@mapmeld] and [@apizzimenti].

The `stateLandingPage.js` provides a single function for rendering
a page related to the `document.head.id` mentioned above. First, the
function loads `/assets/data/landing_pages.json`, a directory of
information we want included with each state.

### [`/assets/data/landing_pages.json`]

This json is essentially a database of modules and sections we're
prepared to include with each state. Each of the 52 or so objects
have the following key entries. With Alabama as our example...

- `"state"`, the full display name, e.g. Alabama
- `"code"`, the postal code, AL
- `"modules"`, a vital entry that allows for the rendering of modules
users can select in the state portal. Its an array with objects of the
form...
  - `"name"`, which desribe an area typically `"Statewide"` and
  sometimes `"Counties"`, `"Cities"` and more. 
  - `"ids"`, an array which corresponds directly with places we have
available
  - `"default"`, an optional designator of the default place for display
  - `"id"`, an id that matches the `"name"`, for instance `"state"`,
`"counties"`, `"loc"` and more, respective to the `"name"`s listed
above.
- "section", an array of sections for display on the portal page, with
`"name'`,`"nav"`, `"type"`, `"content_source"` and sometimes
`"subsections"`. The Alabama page has the following sections. Each
module is rendered by its `type`, of which there are three described
below.
  - "Draw a plan from scratch"
  - "Why?", which draws from `"assets/about/landing/why.html"
  - "Redistricting rules", which draws from 
`"/assets/about/landing/rules.html"`
  - "About the Data", which draws from
`"/assets/about/landing/data.html"` and carries subsections for each
type of data like `"Census Block Groups"` which in turn draws from
`"/assets/about/landing/community_blockgroups.html"`. 

### Using `landing_pages.json` data in `stateLandingPage.js`

The `stateLandingPage.js` function is now ready to render a landing page
with knowledge of our state content preferences loaded in from
`landing_pages.json`. A page `title` is prepared, and a `navlinks(...)`
helper function is called to generate the correct top navbar links,
originally set aside by the original state.html page. 

> Pay special attention to how the default module is minded by the
function. Of all the states, only one module is set to `default`. 

### The `navlinks(sections, placeIds)` helper function

Each state page reserves space for top bar navigation links for nav
class `.site-nav` where navlinks are stored. The sections and placeIds outlined by the state module in 
`landing_pages.json` are loaded into this helper function, which produces a list
of appropriate links to anchors within this state portal page. 

### The `drawPage(stateData, onlyCommunityMode, vraPage)` helper function

Back in `stateLandingPage.js`, we generate a list of available modules using function `listPlacesForState`
in the `components/PlacesList` folder which parses the places for a state using `mockApi` functions.

From the resulting list of places, places where its units entry
are limited with a `limit` entry are filtered away and we're left with
`districtingPlaces`. If no `districtingPlaces` are returned, we then
know we're in `onlyCommunityMode`. 

With this knowledge, we use helper function
`drawPage(stateData, onlyCommunityMode,...)` to render the article class
`.place__content` rendered in the state.html page. This helper function
only returns a `lit-html` render function that displays the following...
- an h1 headline of class `.place__name` of the state's name
- typically, a radio style list for the "Draw Districts" and "Draw
Communities" buttons
- each of the stateDataSection are sent to a new helper function
`drawSection`
- a footer sourced from `assets/about/landing/footer.html`

The js-file lists an original comment explaining how we must handle this
specific process of fetching the html.

> Since this is the longest request on the page, we fire a
page-load-complete event to let all listeners know that the page has
loaded. This lets us scroll the page to the desired section properly.

### The `drawSection(s, stateData, onlyCommunities)` helper function

This beastly `drawSection` function takes each section `s` and renders
each of them per their type. There are three types of sections, `draw`,
`plan` and `text` types.

Sections of `draw` type produce the "Draw a plan from scratch" and
"Draw your community" radio buttons, space is set aside for drawing
subsequent districting and community options, and final links sent to
the `#data` anchor are provided starting with "What are the Building Blocks?"

Sections of `plans` type load buttons for plans which
`landing_pages.json` tells us are available and sections of `text` type
return content stored according to their sources in the
`/assets/about/landing` folder. 

### Districting and Community Options

Typically, there are different ways to create a new plan and always ways
to identify new [communities]. Space was set aside when `drawPage(...)`
was called when elements of ids `#districting-options` and
`community-options` were selected. Now, the following helper functions
will provide these options. 

New plans can be drawn depending on place, problem, and unit. For
instance, one can draw new Arizona plans for 30 state legislative
districts, or congressional districts for 8 old or 9 new seats
constructed out of precincts or census block groups. (Arizona gets one
new seat after 2020.) This one place, with three types of problems out
of two kinds of units results in six different districting options,
gleamed from the `districtingOptions(districtingplaces)` module which
uses either `placeItemsTemplate` or `customPlaceItemsTemplate` to
extract these combinations. 

A similar process is done with communities. Helper function
`communityOptions(places)` selects each place in a list and renders a
button for each possible type of `units`. Arizona communities can be
drawn in precincts or census block groups, resulting in two kinds of
community buttons, with the same repeated for sub-statewide places like
counties, cities and zones. 

That we are able to display new problems reflecting 2020 reapportionment
is thanks to [@jackdeschler]. Recent changes to
`customPlaceItemsTemplate` ensure that these buttons are given priority
in the list.

**It is these buttons that eventually, save the module context into
localStorage for  consumption by the editor.**

The function now ensures that the button corresponding to the default
module is checked true and set new function variable `selected` to this
default. For Arizona, this is the Arizona state-wide new districting
plan module. 

### Custom Number of Districts with `CustomPlaceItemsTemplate(...)`

On Thu., Nov. 19, 2020 [@AtlasCommaJ] wrote a custom selections template
that would be merged into districtr by January. At the top of the page,
`districtingOptions` renders a checkbox that toggles whether place
buttons are rendered with standard `placeItemTemplates(...)` and
`customPlaceItemsTemplate(...)`. If a user desires to change the number
of districts one wants to draw given a specific problem, each plan
button now renders an input type `number`, class `.custom-input` whose
rose is to change the value of `problem.numberOfParts`, up to 55 units. 

When each of these Place Items buttons are clicked, listener
`startNewPlan(...)`, imported from `/routes.js`, saves the problem to
the storage using `savePlanToStorage(...)` and navigates the user to the
editor. 

### Finally

This function finally includes some vra functionality that is currently
being developed and sets an "All About Redistricting" to the relevant
state [Loyola Law Redistricting] page.

# # 

### Suggestions 

- So many anonymous functions are used to render `html`. Perhaps a few longer ones can
be separated out as helper functions
- Functions `drawTitles(...)` and `getProblems(place)` are no longer used anywhere
- Since every state has a statewide plan, `onlyCommunityMode` is no longer needed
- The population of districting and community cards occurs later than when it
is given structure in the HTML. Maybe they should be placed closer together for
clarity.

[Return to Main](../README.md)
- Previous: [The Index Landing Page](../07pages/index.md)
- Next: [PlaceMap](../07pages/placemap.md)


[@jdeschler]: http://github.com/jdeschler
[@mapmeld]: http://github.com/mapmeld
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@jenni-niels]: http://github.com/jenni-niels
[@apizzimenti]: http://github.com/apizzimenti

[`PlaceMap.js`]: ../07pages/placemap.md
[`deploy/_redirects`]: ../09deployment/headersredirects.md
[`stateLandingPage.js`]: ../07pages/districtrstatepages.md

[`src/views/stateLandingPage.js`]: ../../src/views/stateLandingPage.js
[`/assets/data/landing_pages.json`]: ../../assets/data/landing_pages.json
[communities]: ../05landmarks/coi.md

[Loyola Law Redistricting]: https://redistricting.lls.edu

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA