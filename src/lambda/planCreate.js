// planCreate.js
import launchChrome from '@serverless-chrome/lambda';
import CDP from 'chrome-remote-interface';
import mongoose from 'mongoose';

import db from './server';
import Plan from './planModel';
import Sequence from './sequenceModel';

let rnd = () => {
    return Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2)
        + Math.random().toString(36).substr(2);
};

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  try {
      const data = JSON.parse(event.body),
          plan = {
              _id: mongoose.Types.ObjectId(),
              plan: data.plan,
              token: rnd(),
              eventCode: data.eventCode || "",
              hostname: data.hostname,
              startDate: new Date()
          };
      const nextPlanID = await Sequence.findOneAndUpdate({ name: "plan_ids" }, {"$inc": {"value": 1}});
      plan.simple_id = nextPlanID.value;

      await Plan.create(plan);

      const url = "https://districtr.org/edit/" + plan._id;
      launchChrome({
        flags: ['--window-size=1000x500', '--hide-scrollbars']
      })
      .then(() => CDP.List())
      .then(tabs => CDP({ host: '127.0.0.1:9222', target: tabs[0] }))
      .then(client => {
        const Network = client.Network
        Page = client.Page
        return Promise.all([Network.enable(), Page.enable()])
      })
      .then(() => Page.navigate({ url }))
      .then(() => Page.loadEventFired())
      .then(() => Page.captureScreenshot({ format: 'png' }))
      .then(screenshotImage => {
        console.log(screenshotImage.data);
      });

      return {
          statusCode: 201,
          body: JSON.stringify({
              msg: "Plan successfully created",
              simple_id: plan.simple_id,
              token: plan.token
          })
      };
  } catch (err) {
      console.log('plan.create', err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
}
