// planCreate.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body);

      const plan = await Plan.findOne({
          simple_id: event.queryStringParameters.id
      });

      if (!plan) {
          throw new Error('Plan not found');
      }

      plan.plan = data.plan;

      plan.screenshot = data.screenshot || plan.screenshot || "";

      await plan.save();
      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully updated",
              simple_id: plan.simple_id
          })
      };
  } catch (err) {
      console.log('plan.redraw', err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
}
