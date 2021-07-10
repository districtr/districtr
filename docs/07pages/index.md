# Index.html landing page

When a user first navigates to [districtr.org], they are sent to the
index.html landing page, which takes its cues from index.js, the first
stops from which the experience flows.

The first index.html was created by [@maxhully] on Mon., Feb. 25, 2019.
Previously, index.js was responsible for generating a landing page and
was created earlier, on Tue. Jan. 29, 2019. index.js has been
compelted by [@mapmeld] with help from [@jenni-niels] whereas
`index.html` is currently extended by the same and maintained by
[@AtlasCommaJ] with help from [@jdeschler] and [@robbie-veglahn].

## [index.html]

When users navigate to districtr.org, they are in essence navigating to
the site's root "/" folder, which defaults by convention to
`index.html`. This file, is responsible for creating the main structure
of the site's landing page.

First comes the header of class `.site-header` which contains the top
bar nav class `site.nav`. This features the following, populated by an
in-line function `openNav()`
- A site logo and link
- Nav links on...
  - How to Use
  - Jump to the Map
  - About Districtr
  - What's New?

Then comes the main section of id `#root` and class `landing-page`. It is
populated by various sections.
- The splash header
- The takeaway
- Major content sections with titles...
   - Help shape our democracy!
   - Use this tool to amplify your voice
   - You can draw districts
   - You can draw your community

One main section is the [`PlaceMap`] section titled "Where would you
like to start". Users can also import an "Existing Plan or Community
Map" and check out "Features Available by Juristiction."

**It is these links that navigate users to [state landing pages].**

Then another major section titled "About Districtr" explains our...
- Values
- contact for Questions
- Team
- Technologies in use

## [`/src/views/index.js`]

When `index.html` calls `index.js` (compiled into a polyfill to ensure
compatibility with a wide variety of browsers), index is responsible for
calling `renderInitialView()`, which mostly modifies the section id
`#start-distrcting` which holds the `PlaceMap`, which is kept hidden
until the map loads properly. It is `PlaceMapWithData()` that provides
this map.

Function `initializeAuthContext(...)` is also called from `api/auth.js`,
though we no longer require any sign ins or registration.

It is the links in the [`PlaceMap`] that helps us explore the rest of
the site.

### Helper Functions

- Constant `uploadPlan` is used for the button that allows users to
upload a JSON or CSV plan. This is a `PlanUploader` object that is
caused to render.
- `clearQueriesFromURL()` is used to extract any queries of form `?` in
the history, though it was only really used when we had user logins

# #

### Suggestions

It is vestigial to have a sign in header or `initializeAuthContext`,
which makes `clearQueriesFromURL()` less important.

# #

[Return to Main](../README.md)
- Next: [Districtr State Pages](../07pages/districtrstatepages.md)
- [PlaceMap](../07pages/placemap.md)


[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld
[@AtlasCommaJ]: http://github.com/AtlasCommaJ
[@jenni-niels]: http://github.com/jenni-niels
[@jdeschler]: http://github.com/jdeschler
[@robbie-veglahn]: http://github.com/robbie-veglahn

[districtr.org]: http://districtr.org
[`/src/views/index.js`]: ../../src/views/index.js

[`PlaceMap`]: ../07pages/placemap.md
[state landing pages]: ../07pages/districtrstatepages.md

[index.html]: ../../html/index.html

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA