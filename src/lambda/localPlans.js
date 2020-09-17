// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    let search2 = { }
    search2["plan.assignment." + event.queryStringParameters.id] = { $exists : true };
    const plans = await Plan.find(search2).select('plan');
    // be careful not to share secret token

    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Plans successfully searched",
            plans: plans
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
