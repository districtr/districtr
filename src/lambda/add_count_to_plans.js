// ./node_modules/@babel/node/bin/babel-node.js src/lambda/add_count_to_plans.js
import mongoose from 'mongoose';
import db from './server';
import Plan from './planModel';

Plan.find({}, (err, plans) => {
  console.log(err || plans.length);
  plans.forEach((data, x) => {
      if (data.plan && data.plan.assignment) {
          data.filledBlocks = 0;
          Object.keys(data.plan.assignment).forEach(key => {
              if (typeof data.plan.assignment[key] !== null) {
                  data.filledBlocks++;
              }
          });
          console.log(data.filledBlocks);
          data.save();
      } else {
          console.log(data);
      }
  });
});
