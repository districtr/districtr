// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    let search = event.queryStringParameters.module,
        stateSearch = event.queryStringParameters.state;
    const plans = await Plan.find({ "$and": [
        {"plan.problem.type": "community"},
        // "plan.units.id": "blockgroups",
        {"eventCode": { "$ne": null }},
        {"eventCode": { "$ne": "" }},
        {"$or":[
          {"plan.place.id": search},
          {"$and": [
            {"plan.place.state": stateSearch},
            {"plan.units.id": "blockgroups"},
          ]}
        ]},
    ]}).select('plan simple_id eventCode planName') // be careful not to share secret token
    .sort([["simple_id", -1]])
    .limit(20);

    return {
        statusCode: 200,
        body: JSON.stringify(plans)
    };
  } catch (err) {
      console.log(err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
};
