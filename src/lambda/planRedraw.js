// planCreate.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

exports.handler = async (event, context) => {
  context.callbackWaitsForEmptyEventLoop = false

  return {
      statusCode: 500,
      body: 'false'
  }
}
