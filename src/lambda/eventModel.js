// eventModel.js
import mongoose from 'mongoose'
// Set Event Schema
const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: {
    type: String,
    required: [true, 'Name field is required'],
    max: 200
  },
  map: {
    type: String,
    required: [true, 'Map field is required']
  },
  shortcode: {
    type: String
  }
}),
Event = mongoose.model('event', schema)
export default Event
