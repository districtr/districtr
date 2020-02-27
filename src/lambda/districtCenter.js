// districtCenter.js
const { Pool } = require('pg');
const states = [
    "alaska",
    "arkansas",
    "california",
    "chicago",
    "colorado",
    "georgia",
    "hawaii",
    "illinois",
    "iowa",
    "ma",
    "ma_02",
    "maryland",
    "michigan",
    "minnesota",
    "mississippi",
    "nc",
    "new_mexico",
    "newyork",
    "ohio",
    "oklahoma",
    "oregon",
    "pennsylvania",
    "providence_ri",
    "rhode_island",
    "texas",
    "utah",
    "vermont",
    "virginia",
    "washington",
    "wisconsin"
];

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  try {
      const client = new Pool({
          connectionString: process.env.POSTGRES_CONNECT
      });

      const request = JSON.parse(event.body),
            ids = request.ids,
            state = request.state;

      if (!states.includes(state)) {
          throw new Error("did not recognize state in districtCenter.js");
      }
      if (typeof ids !== "string") {
          throw new Error("expected comma-separated list of unit IDs");
      }

      await client.connect();

      const res = await client.query('SELECT api.merged_' + state + '($1)', [ids]);
      client.end();
      return {
          statusCode: 201,
          body: JSON.stringify(res.rows[0])
      };
  } catch (err) {
      console.log('district.center', err) // output to netlify function log
      return {
          statusCode: 500,
          body: JSON.stringify({msg: err.message})
      }
  }
}
