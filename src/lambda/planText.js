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

    let txt = '';
    if (plan.plan.problem.type && plan.plan.problem.type === "community") {
      if (plan.plan.parts) {
        plan.plan.parts.forEach((part) => {
          txt += ' ' + part.name + ' ' + part.description;
        });
      }

      if (plan.plan.place && plan.plan.place.landmarks && plan.plan.place.landmarks.data && plan.plan.place.landmarks.data.features) {
        plan.plan.place.landmarks.data.features.forEach((landmark) => {
          txt += ' ' + landmark.properties.name + ' ' + landmark.properties.short_description;
        });
      }
    }

    return {
        statusCode: 200,
        headers: headers,
        body: JSON.stringify({
            msg: "Plan successfully found",
            txt: txt,
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
