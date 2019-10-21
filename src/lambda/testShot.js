import "babel-polyfill";

import db from './server';
import Plan from './planModel';

import launchChrome from '@serverless-chrome/lambda';
import CDP from 'chrome-remote-interface';

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const findID = event.queryStringParameters.id;
  const plan = await Plan.findOne({ _id: findID });

  if (!plan) {
    return callback(new Error('Not valid plan ID'));
  }

  const url = "https://districtr.org/edit/" + findID;
  let Page = null,
      DOM = null;

  try {
      launchChrome({
        flags: ['--window-size=1000x500', '--hide-scrollbars', '--headless']
      })
      .then(() => CDP.List())
      .then(tabs => CDP({ host: '127.0.0.1:9222', target: tabs[0] }))
      .then(client => {
        console.log('client Network');
        const Network = client.Network;
        Page = client.Page;
        DOM = client.DOM;
        return Promise.all([Network.enable(), Page.enable()])
      })
      .then(() => Page.navigate({ url }))
      .then(() => Page.loadEventFired())
      .then(() => {
          function wait_for_element(selector) {
              DOM.getDocument({
                  depth: 5
              }, (error, response) => {
                  // log(JSON.stringify(response.root, null, 4));

                  const rootNodeId = response.root.nodeId;
                  const options = {
                      nodeId: rootNodeId,
                      selector: selector
                  };

                  DOM.querySelector(options, (error, response) => {
                      console.log(response);
                      if (response.nodeId == 0) {
                          // log(`Element '${selector}' not found after ${Date.now() - interactionStartTime}ms.`)
                          setTimeout(function() {
                              wait_for_element(selector)
                          }, 300);
                      } else {
                          // client.close();
                          // chrome.kill();
                          // const response = {
                          //     statusCode: 200,
                          //     body: `${Date.now() - interactionStartTime}`,
                          // };
                          Page.captureScreenshot({ format: 'png' })
                            .then(screenshot => {
                                plan.screenshot = screenshot.data;
                                plan.save();
                                callback(null, {
                                    statusCode: 200,
                                    body: JSON.stringify({
                                        msg: "Made screenshot of plan",
                                        _id: findID
                                    })
                                });
                            });
                      }
                  });
              });
          };
          wait_for_element('.toolbar');
      });
  } catch (e) {
      callback(e);
  }
};
