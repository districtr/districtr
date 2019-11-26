import eventRead from "./lambda/eventRead";
setTimeout(() => {
  eventRead.close((err) => {
    console.log(err);
  });
}, 2000);

// import planCreate from "./lambda/planCreate";
// import planUpdate from "./lambda/planUpdate";
// import planRead from "./lambda/planRead";
