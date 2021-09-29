// planRead.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
    const eventCode = (event.queryStringParameters.event || "").toLowerCase().replace(/_/g, '-');
    const myHost = event.queryStringParameters.hostname;
    const planType = event.queryStringParameters.type;
    if (!eventCode.trim().length) {
        return {
            statusCode: 301,
            body: JSON.stringify({
                msg: "Set event= parameter"
            })
        };
    }

    const skipNum = Number(event.queryStringParameters.skip) || 0;

    let plans,
        query = {
          eventCode: eventCode,
        };
    if (planType === "coi") {
      query['plan.problem.pluralNoun'] = 'Community';
    } else if (planType === "plan") {
      query['plan.problem.pluralNoun'] = { '$ne': 'Community' };
    } else if (planType === 'draft') {
      query['isScratch'] = true;
    } else {
      query['isScratch'] = { '$ne': true };
    }
    if (skipNum) {
      plans = await Plan.find(query)
      .select("_id simple_id startDate plan.problem plan.place plan.placeId plan.units screenshot2 planName isScratch")
      .sort([["simple_id", -1]])
      .skip(skipNum)
      .limit(Number(event.queryStringParameters.limit || 8));
    } else {
      plans = await Plan.find(query)
      .select("_id simple_id startDate plan.problem plan.place plan.placeId plan.units screenshot2 planName isScratch")
      .sort([["simple_id", -1]])
      .limit(Number(event.queryStringParameters.limit || 8));
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
