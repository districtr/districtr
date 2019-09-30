// eventCreate.js
import mongoose from 'mongoose'
// Load the server
import db from './server'
// Load the Product Model
import Event from './eventModel'
exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const data = JSON.parse(event.body),
          eventr = {
            _id: mongoose.Types.ObjectId(),
            name: data.name,
            map: data.map,
            shortcode: data.shortcode,
            __v: 0
          },
          response = {
            msg: "Product successfully created",
            data: eventr
          }

    await Event.create(eventr)
return {
      statusCode: 201,
      body: JSON.stringify(response)
    }
  } catch (err) {
    console.log('event.create', err) // output to netlify function log
    return {
      statusCode: 500,
      body: JSON.stringify({msg: err.message})
    }
  }
}
