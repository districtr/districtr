// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const eventCode = (event.queryStringParameters.event || "").toLowerCase().replace(/_/g, '-');
    const myHost = event.queryStringParameters.hostname;
    if (!eventCode.trim().length) {
        return {
            statusCode: 301,
            body: JSON.stringify({
                msg: "Set event= parameter"
            })
        };
    }

    const skipNum = Number(event.queryStringParameters.skip) || 0;

    let plans;
    if (skipNum) {
      plans = await Plan.find({
          eventCode: eventCode
      })
      .select("_id simple_id startDate plan screenshot2 planName isScratch")
      .sort([["simple_id", -1]])
      .skip(skipNum)
      .limit(Number(event.queryStringParameters.limit || 16));
    } else {
      plans = await Plan.find({
          eventCode: eventCode
      })
      .select("_id simple_id startDate plan screenshot2 planName isScratch")
      .sort([["simple_id", -1]])
      .limit(Number(event.queryStringParameters.limit || 16));
    }

    // be careful not to share token here
    return {
        statusCode: 200,
        body: JSON.stringify({
            msg: "Plan(s) successfully found",
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
