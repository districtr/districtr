# Deploy Folder


Jul 22, 2019

Headers

Access-Control-Allow-Origin: *
/assets/data/*
/assets/plans/*
/es6/embedded.js*
/es5/embedded.js
/css/*

Redirects

Netlify Redirects!

/edit/* /edit.html 200
/plan/* /plan.html 200
/Plan/* /plan.html 200
/coi/* /COI.html 200
/COI/* /COI.html 200
/edit/* /edit.html 200
/event/* /event.html 200
/tag/* /tag.html 200
/group/* /group.html 200
/user_guide /guide

## Landing Pages
/alabama/*          /alabama.html 200
/alaska/*           /alaska.html 200

/new/al/*          /alabama
/new/ak/*           /alaska
/new/az/*          /arizona

/new/AL/*          /alabama
/new/AK/*           /alaska
/new/AZ/*          /arizona
/new/AR/*         /arkansas
/new/CA/*       /california

/community/al/*          /alabama?mode=coi
/community/ak/*           /alaska?mode=coi
/community/az/*          /arizona?mode=coi
/community/ar/*         /arkansas?mode=coi

/community/AL/*          /alabama?mode=coi
/community/AK/*           /alaska?mode=coi
/community/AZ/*          /arizona?mode=coi

/new/:state/*       /:state
/community/:state/*       /:state?mode=coi

/new/* /new.html
/community/* /community.html
/communities/* /community.html

## Plan Redirects
/lowell-districts /edit?url=/assets/plans/lowell-districts.json#plan

# last failed typos
/new/*        /new
/community/*  /community
/*            /
