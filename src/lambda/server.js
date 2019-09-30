// server.js
import "babel-polyfill";
import mongoose from 'mongoose'
const dotenv = require('dotenv').config()
// Initialize connection to database
const dbUrl = process.env.DB_URL,
      dbOptions = {
        useNewUrlParser: true,
        useFindAndModify: false
      }
// Set DB from mongoose connection
console.log("start connect");
mongoose.connect(dbUrl, dbOptions)
console.log("made connect");
const db = mongoose.connection
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
export default db
