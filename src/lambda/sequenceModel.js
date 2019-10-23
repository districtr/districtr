// sequenceModel.js
/*
  there's no built-in auto-increment IDs in MongoDB
  they use a long hex string like 5d9629d2f6986abe7ba608df
  this is nice for big MongoDB clusters but not nice for humans
  Using a sequence model to get atomic, auto-increment IDs:
  http://polyglot.ninja/auto-incrementing-ids-for-mongodb/
*/
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  value: Number
}),
Sequence = mongoose.model('sequences', schema)
export default Sequence
