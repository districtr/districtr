// planCreate.js
import mongoose from 'mongoose';

import db from './server';
import Plan from './planModel';
import Sequence from './sequenceModel';

let rnd = () => {
    return Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2);
};

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body),
          plan = {
              _id: mongoose.Types.ObjectId(),
              plan: data.plan,
              token: rnd(),
              eventCode: data.eventCode || "",
              hostname: data.hostname,
              screenshot: data.screenshot,
              startDate: new Date()
          };
      const nextPlanID = await Sequence.findOneAndUpdate({ name: "plan_ids" }, {"$inc": {"value": 1}});
      plan.simple_id = nextPlanID.value;

      await Plan.create(plan)
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully created",
              simple_id: plan.simple_id,
              token: plan.token
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
