# MongoDB and Lambdas

[Mongo DB] is the way we save plans that users create such that we can
load them later. [Netlify], our website's cloud server and is
responsible for coordinating between districtr and the database using
custom functions written for Netlify stored in the github [/lambdas]
folder.

[@maxhully] first helped deploy districtr on Netlify between April
and July 2019. [@mapmeld] extended this work between October and
December 2019 to include MongoDB.

According to Netlify, lambda functions allow websites to
"deploy server-side code that works as API endpoints, runs automatically
in response to events, or processes more complex jobs in the
background." Districtr usually uses [`routes.js`] to navigate to plans
using the url `/.netlify/functions/...` with appropriate queriesbfor the
following functions...

- server.js
- planModel.js
- planCreate.js
- planRead.js
- planUpdate.js
- eventRead.js
- moduleRead.js
- planContiguity.js
- planPreview.js
- planText.js
- requetsedModel.js
- sequenceModel.js

## Server.js

Provides the mongoose connection for other functions using `dbUrl` and
`dbOptions` to provide a `db` ready for import.

## Working with Plans

The [plan/context] is specified in `planModel.js` and are created and
read using `planCreate.js` and `planRead.js`. Previously created plans
can be updated using `planUpdate.js`.

The plan model is a Mongoose DB style schema with the following
fields and types. 

- `_id`, a mongoose.Schema.Types.ObjectId,
- `plan`, Object,
- `eventCode`, String up to 50 chars,
- `planName`, String up to 50 chars,
- `hostname`, String up to 100 chars,
- `simple_id`: Number,
- `token`, a random String of numbers,
- `startDate`, a Date,
- `screenshot`, a String,
- `isScratch`: Boolean,
- `name`, a vestigial, commented out field. 

Note that plan details like assignment and units are encapsulated in
the `plan` field and that the other fields handle metadata.
`planModel.js` provides a mongoose model `Plan` that can be used when
creating plans.

`PlanCreate.js` fill out plan details from event `e` and uses `Plan` 
to create the plan in the mongodb and return a status code. To read a
plan, we also use `Plan` to query parameters from `event` to connect to
a server and retrieve a plan. If all goes well, a JSON object is
returned with a status message and the details of the plan itself. 

Finally, created plans can be updated using `planUpdate.js`. The
function checks if the plan has a valid token, when the plan was created
and when the plan was created. Other `plan` details are carried over
with a new `plan.startdate.`

> Plans can only be updated up to 24-hours on creation. Updating of
older plans results in the creation of a new plan.

## Other Plan functions

The original way contiguity was calculated for plans was through
`planContiguity.js`. Through a hard-coded filter, plans were sent to a
`https://mggg-states.subzero.cloud` function. This is deprecated.

Function `planPreview.js` is similar to `planRead.js` but provides a
screenshot together with the full plan and the simple id. 

Function `planText.js` returns a text string for community plans that
describes community and landmark names with their descriptions. 

## Functions that Return Other Objects

To help organize plans for certain organizations and missions, plans
have the option of being assigned a plan code. To collect these plans in
[`event.js`], `eventRead.js` is used to query the database for plans that
share the same event code.

Function `moduleRead.js` is a relatively is a new function from May of
2021 for use with [Communities of Interest]. It returns plans whose
problem type is `community`, the event code is blank matches either the
requested module or belongs to the requested state and whose units are
Block Groups. 

## Utility Models

A pair of models aassist in the completion of Netlify lambdas, by
providing simple frameworks for common tasks. 

`requestedModel.js` provides object `Requested` to hold information on
users that request information and their desired distrct type and other
infromation, used when people use the form to ask for new modules. 

The `Sequence` object is provided by `sequenceModel.js` and helps
`planCreate.js` make new id numbers in an incremental fashion.

# #

### Suggestions

- `db` from `server.js` is imported but not used in the following files
but is required for creating a MongoDB connection.
- planContiguity.js is deprecated. 

# #

[Return to Main](../README.md)
- [Routes](../09deployment/routes.md)
- [Intro to districtr-eda](../09deployment/districtreda.md)
- Previous: [Intro to mggg-states](../09deployment/mggg-states.md)
- Next: [Headers and Redirects](../09deployment/headersredirects.md)
- [package.json and npm](../09deployment/package.md)

[@maxhully]: http://github.com/maxhully
[@mapmeld]: http://github.com/mapmeld

[`routes.js`]: ../09deployment/routes.md

[plan/context]: ../01contextplan/plancontext.md
[Communities of Interest]: ../05landmarks/coi.md
[`event.js`]: ../08events/event.md

[/lambdas]: ../../lambdas
[Netlify]: https://www.netlify.com/
[Mongo DB]: https://www.mongodb.com/

# #

<img src="../../assets/mggg.svg" width=25%>

[The Metric Geometry and Gerrymandering Group Redistricting Lab](http://mggg.org)

Tufts University, Medford and Somerville, MA