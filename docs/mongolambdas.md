# MongoDB and Lambdas

eventRead.js
moduleRead.js
planContiguity.js
planCreate.js
planModel.js
planPreview.js
planRead.js
planText.js
planUpdate.js
requetsedModel.js
sequenceModel.js
server.js

```
// server.js
import "babel-polyfill";
import mongoose from 'mongoose'
const dotenv = require('dotenv').config();


const dbUrl = process.env.DB_URL,
      dbOptions = {
        useNewUrlParser: true,
        useMongoClient:true,
        useFindAndModify: false,
        useUnifiedTopology: true
      };

console.log("start connect");
mongoose.connect(dbUrl, dbOptions)
console.log("made connect");
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
export default db
```

saveplantodb in routes

netlify plan update or plan create

import db from server
import Plan from planModel
import Sequence from sequenceModel





