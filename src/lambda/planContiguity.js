// planContiguity.js
import querystring from "querystring";
import fetch from "node-fetch";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
      return new Promise((resolve, reject) => {
          fetch('https://mggg-states.subzero.cloud/rest/rpc/contiguity_pennsylvania', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                  ids: JSON.parse(event.body).ids
              })
          })
          .then(resp => resp.json())
          .then((data) => {
              resolve({
                  statusCode: 200,
                  body: JSON.stringify(data)
              });
          });

      });
  } catch (err) {
      console.log(err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
};
