// planCreate.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';
import Sequence from './sequenceModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body),
          plan = {
              _id: mongoose.Types.ObjectId(),
              plan: data.plan,
              eventCode: data.eventCode,
              hostname: data.hostname
          };
      const nextPlanID = await Sequence.findOneAndUpdate({ name: "plan_ids" }, {"$inc": {"value": 1}});
      plan.simple_id = nextPlanID.value;

      await Plan.create(plan)
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully created",
              simple_id: plan.simple_id
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
