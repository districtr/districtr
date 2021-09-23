// planCreate.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body),
          token = data.token.replace(/\s+/g, '');

      if (!data.token.length) {
          throw new Error('No token for update');
      }

      let eid = event.queryStringParameters.id;
      try {
        eid = Number(eid);
      } catch(e) {
        
      }

      const plan = await Plan.findOne({
          simple_id: eid,
          token: token
      });

      if (!plan) {
          throw new Error('Token did not match plan ID');
      }

      if (plan.startDate < (new Date() * 1) - 24 * 60 * 60 * 1000) {
          // 24 hour limit
          throw new Error('Plan is over 24 hours old');
      }

      plan.plan = data.plan;
      plan.eventCode = (data.eventCode || plan.eventCode || "").toLowerCase().replace(/_/g, '-').replace(/\s/g, ''),

      plan.planName = data.planName || plan.planName || "";
      plan.isScratch = data.isScratch || false;
      plan.startDate = new Date();

      let rep = await plan.save();
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully updated",
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
