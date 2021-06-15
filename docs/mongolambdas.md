# MongoDB and Lambdas

Mongo DB is the way we save plans that users create such that we can
load them later. Netlify, our website's cloud server, is responsible
for coordinating between districtr and the database using custom
functions written for Netlify stored in the github /lambdas folder.

Netlify from Mar 24, 2020, districtr, 
Jul 26, 2019 at 9:24 AM

September 30, 2019. 

Ubuntu Xennial, 
npm build
deploy previews

According to Netlify, these functions allow websites to "deploy server-side
code that works as API endpoints, runs automatically in response to events,
or processes more complex jobs in the background." Districtr usually uses `routes.js`
to navigate to plans using the url `/.netlify/functions/...` with appropriate queries
for the following functions...


- server.js
- planModel.js
- planCreate.js
- planRead.js
- planUpdate.js, Oct. 21, 2019

- eventRead.js
- moduleRead.js
- planContiguity.js
- planPreview.js
- planText.js
- requetsedModel.js
- sequenceModel.js

## Server.js

Provides the mongoose connection for other functions using
`dbUrl` and `dbOptions` to provide a `db` ready for import.

## Working with Plans

The plan/context is specified in `planModel.js` and are created and read using
`planCreate.js` and `planRead.js`. Previously created plans can be 
updated using `planUpdate.js`.

The plan model is a Mongoose DB style schema with the following
fields and types. 

- `_id`, a mongoose.Schema.Types.ObjectId,
- `plan`, Object,
- `eventCode`, String up to 50 chars,
- `planName`, String up to 50 chars,
- `hostname`, String up to 100 chars,
- `simple_id: Number,
- `token`, a random String of numbers,
- `startDate`, a Date,
- `screenshot`, a String,
- `isScratch`: Boolean,
- `name`, a vestigial, commented out field. 

Note that plan details like assignment and units are encapsulated in
the `plan` field and that the other fields handle metadata. `planModel.js`
provides a mongoose model `Plan` that can be used when creating plans.

`PlanCreate.js` fill out plan details from event `e` and uses `Plan` 
to create the plan in the mongodb and return a status code. To read a plan, 
we also use `Plan` to query parameters from `event` to connect to
a server and retrieve a plan. If all goes well, a JSON object is returned
with a status message and the details of the plan itself. 

_db not used in `planread`

Finally, created plans can be updated using `planUpdate.js`. The function
checks if the plan has a valid token, when the plan was created and when
the plan was created. Other `plan` details are carried over with a new
`plan.startdate.`

> Plans can only be updated up to 24-hours on creation. Updating of older
plans results in the creation of a new plan.

## Other Plan functions

- planContiguity.js
- planPreview.js



###

- eventRead.js
- moduleRead.js



- planText.js
- planUpdate.js
- requetsedModel.js
- sequenceModel.js




saveplantodb in routes

netlify plan update or plan create

import db from server
import Plan from planModel
import Sequence from sequenceModel





