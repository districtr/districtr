// planRequest.js
import mongoose from 'mongoose';

import db from './server';
import Requested from './requestedModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = new URLSearchParams(event.body),
          plan = {
              _id: mongoose.Types.ObjectId(),
              user: {
                first: data.get('first'),
                last: data.get('last'),
                email: data.get('email'),
                organization: data.get('organization') || "",
              },
              name: data.get('name'),
              districtTypes: data.get('districtTypes'),
              information: data.get('information')
          };

      await Requested.create(plan)
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Request was successful",
              _id: plan._id
          })
      };
  } catch (err) {
      console.log('requested.create', err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
}
