// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    let findParams = JSON.parse(event.body);
    const plans = await Plan.find(findParams);

    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Plan(s) successfully found",
            data: plans
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
