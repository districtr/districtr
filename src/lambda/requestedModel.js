// planModel.js
import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  user: {
    first: String,
    last: String,
    email: String,
    organization: String
  },
  name: String,
  districtTypes: String,
  information: String
}),
Requested = mongoose.model('requested', schema)
export default Requested
