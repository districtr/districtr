// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    let search = { _id: event.queryStringParameters._id },
        myHost = event.queryStringParameters.hostname;
    if (myHost) {
        // optional: limit search to prod or test plans
        // by default search all plans
        search.hostname = myHost;
    }
    const plan = await Plan.findOne(search);

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
