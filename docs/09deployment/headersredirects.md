# Deploy Folder

Under the Deploy Folder, there are a pair of files, `_headers` and
`_redirects`, which helps us deploy districtr through Netlify just the
way we like. These files were first written on Mon., Jul. 22, 2019 by
[@maxhully]. We also write functions for netlify known as [lambdas]

## Headers

The header file is a simple list of folders whose files are given
the custom response header `Access-Control-Allow-Origin`, which allows
the response to be shared with code of any origin. 

- `/assets/data/*`
- `/assets/plans/*`
- `/es6/embedded.js*`
- `/es5/embedded.js`
- `/css/*`

## Redirects

The redirects file is essentially a long list of aliases that help
certain urls navigate to the correct html file. They come in various
parts. All are set to return an HTTP 200 OK response.

### Cleaning up simple files

One category directs folder urls to htmls, e.g. `/edit/*` to
[`edit.html`]. This is true for...
- `/edit/*`
- `/plan/*`
- `/coi/*`
- `/edit/*`
- `/event/*`
- `/tag/*` 
- `/group/*`
- `/new/*` and
- [`/community/*`] (with `/communities/*`).

Separately, `/user_guide` redirects to `/guide`. 

> Remember, according to package.json, `COI.html` and `plan.html` are
aliases for `edit.html`. Both `tag.html` and `group.html` are aliases
for `event.html`.

## Landing Pages

Various url formats for state landing pages are sent to their
corresponding state html pages. For instance, each of the following urls
are sent to `alabama.html`. 

- `/alabama/*`
- `/new/al/*`
- `/new/AL/*`

URL type `/community/al/*` directs to `/alabama?mode=coi` which informs
`alabama.html` through `StateLandingPages.js` to display community of
interest options.

## Specific Places

We can also pass stored plans to `edit.html`/`edit.js` through the URL.
For instance, varieties of `/lowell-districts` and
`/plans/lowell-districts` are sent to
`/edit?url=/assets/plans/lowell-districts.json#plan`. 

# Typos

Finally, the following are set to be redirected. They exist to provide
backwards compatibility with old state URLs. 

- `/new/*` to `/new`
- `/community/*` to `/community`
- `/*`  to `/`

# #

[Return to Main](../README.md)
- [Routes](../09deployment/routes.md)
- [Intro to districtr-eda](../09deployment/districtreda.md)
- [Intro to mggg-states](../09deployment/mggg-states.md)
- Previous: [Netlify Lambda Functions and MongoDB](../09deployment/mongolambdas.md)
- Next: [package.json and npm](../09deployment/package.md)

# #

[@maxhully]: http://github.com/maxhully

[`edit.html`]: ../02editormap/editor.md
[`/community/*`]: ../05landmarks/coi.md
[lambdas]: ../09deployment/mongolambdas.md

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA