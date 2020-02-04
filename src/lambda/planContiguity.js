// planContiguity.js
import querystring from "querystring";
import fetch from "node-fetch";

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const eventBody = JSON.parse(event.body);

  try {
      if (!['alaska', 'chicago', 'colorado', 'georgia', 'hawaii', 'iowa', 'ma',
        'ma_02', 'maryland', 'michigan', 'minnesota', 'mississippi', 'nc',
        'new_mexico', 'ohio', 'oklahoma', 'oregon', 'pennsylvania',
        'providence_ri', 'rhode_island', 'texas', 'utah', 'virginia',
        'vermont', 'wisconsin'].includes(eventBody.state)) {
          throw new Error('State not included in PostGIS, according to planContiguity.js');
      }

      return new Promise((resolve, reject) => {
          fetch('https://mggg-states.subzero.cloud/rest/rpc/contiguity_' + eventBody.state, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: eventBody.ids })
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
