// planCreate.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body),
          plan = {
              _id: mongoose.Types.ObjectId(),
              plan: data
          };

      await Plan.create(plan)
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully created",
              _id: plan._id
          })
      };
  } catch (err) {
      console.log('plan.create', err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
}
