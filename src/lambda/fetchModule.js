
const modules = require("../../assets/data/response.json");

exports.handler = (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
    let search = event.queryStringParameters.id,
        state = event.queryStringParameters.state;

    const plans = modules.filter(m => {
        state ? (m.state === state) : (m.id === search)
    });

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
