// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET'
  };

  try {
    let search = event.queryStringParameters._id ?
          { _id: event.queryStringParameters._id }
          : { simple_id: event.queryStringParameters.id }
        ,
        myHost = event.queryStringParameters.hostname;
    if (myHost) {
        // optional: limit search to prod or test plans
        // by default search all plans
        search.hostname = myHost;
    }
    const plan = await Plan.findOne(search).select('plan');
    // be careful not to share secret token

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            msg: "Plan successfully found",
            plan: plan.plan
        })
    };
  } catch (err) {
      console.log(err) // output to netlify function log
      return {
          statusCode: 500,
          headers: headers,
          body: JSON.stringify({msg: err.message})
      }
  }
};
