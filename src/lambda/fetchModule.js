
const modules = require("../../assets/data/response.json");

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  console.log(event.queryStringParameters);

  try {
    let search = event.queryStringParameters.id,
        state = event.queryStringParameters.state;

    const plans = modules.filter(m => {
        return state ? (m.state === state) : (m.id === search)
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
