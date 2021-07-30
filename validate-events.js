// check
const {
  stateForEvent,
  validEventCodes,
  coi_events,
  hybrid_events,
  eventDescriptions,
  longAbout,
} = require("./assets/events/events.js");

const fs = require("fs"),
      fetch = require("node-fetch");

const states = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Puerto Rico",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington, DC",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming"
];

function validateEvents() {
  Object.keys(validEventCodes).forEach((code) => {
    if (!stateForEvent[code]) {
      console.error("No state listed for " + code);
      process.exit(1);
    }
    if (!states.includes(stateForEvent[code])) {
      console.error(code + " state code is not valid");
      process.exit(1);
    }
    if (!eventDescriptions[code]) {
      console.error(code + " missing description");
      process.exit(1);
    }

    function checkModuleMatch(singleMod) {

    }

    let eventMatches = validEventCodes[code];
    if (typeof eventMatches === 'object') {
      eventMatches.forEach(checkModuleMatch);
    } else {
      checkModuleMatch(eventMatches);
    }
  });
}


validateEvents();
