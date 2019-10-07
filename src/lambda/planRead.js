// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const findID = event.queryStringParameters._id;
    const plan = await Plan.findOne({ _id: findID });

    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Plan(s) successfully found",
            plan: plan.plan
        })
    };
  } catch (err) {
      console.log(err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
};
