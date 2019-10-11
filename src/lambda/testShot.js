import launchChrome from '@serverless-chrome/lambda';
import CDP from 'chrome-remote-interface';

import db from './server';
import Plan from './planModel';


exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const findID = "5d9629d2f6986abe7ba608df";
  const plan = await Plan.findOne({ _id: findID });

  const url = "https://districtr.org/edit/" + findID + "&t=3";
  let Page = null,
      DOM = null;
  launchChrome({
    flags: ['--window-size=1000x500', '--hide-scrollbars', '--headless']
  })
  .then(() => CDP.List())
  .then(tabs => CDP({ host: '127.0.0.1:9222', target: tabs[0] }))
  .then(client => {
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
                                              return true;
                                          });
                                    }
                                });
                            });
                        };
                        wait_for_element('.toolbar');
  });

  return {
      statusCode: 201,
      body: JSON.stringify({
          msg: "Plan successfully created",
          _id: findID
      })
  };
};
