# Deploy Folder

Under the Deploy Folder, there are a pair of files, `_headers`
and `_redirects`, which helps us deploy districtr through Netlify
just the way we like. These files were first written on Mon., Jul.
22, 2019 by [@maxhully]. 

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

One category directs folder urls to htmls, e.g. `/edit/*` to `edit.html`. 
This is true for `/edit/*`, `/plan/*` , `/coi/*`, `/edit/*`, `/event/*`,
`/tag/*`, and `/group/*`, `/new/*` and `/community/*` (with `/communities/*`). Separately, `/user_guide` redirects to `/guide`. 

> Remember, according to package.json, `COI.html` and `plan.html` are aliases
for `edit.html`. Both `tag.html` and `group.html` are aliases for `event.html`.

## Landing Pages

Various url formats for state landing pages are sent to their corresponding
state html pages. For instance, each of the following urls are sent to
`alabama.html`. 

- `/alabama/*`
- `/new/al/*`
- `/new/AL/*`

URL type `/community/al/*` directs to `/alabama?mode=coi` which informs
`alabama.html` through `StateLandingPages.js` to display community of
interest options.

## Various Portals

We can also pass stored plans to `edit.html`/`edit.js` through the URL.
For instance, varieties of `/lowell-districts` and `/plans/lowell-districts`
are sent to `/edit?url=/assets/plans/lowell-districts.json#plan`. 

# Typos

Finally, the following are set to be redirected.

- `/new/*` to `/new`
- `/community/*` to `/community`
- `/*`  to `/`
