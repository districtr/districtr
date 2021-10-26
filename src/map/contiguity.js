/* eslint-disable linebreak-style */

// This makes a POST request to a PythonAnywhere server
// with the assignment in the request body.
// The server will return a response with the
// 1. contiguity status and
// 2. number of cut edges
// and this function then calls two other functions (defined above)
// that modify the innerHTML of the file

import { unitBordersPaintProperty } from "../colors";
import { stateNameToFips } from "../utils";

export default function ContiguityChecker(state, brush) {
  let place = state.place.id,
      extra_source = (state.units.sourceId === "ma_precincts_02_10") ? "ma_02" : 0;
  if (state.units.sourceId === "ma_towns") {
      extra_source = "ma_towns";
  }
  const placeID = extra_source || place;
  const sep = (state.place.id === "louisiana") ? ";" : ",";

  if (!state.contiguity) {
    state.contiguity = {};
  }

  function updateIslandBorders(checkboxFlipped) {
    let islandAreas = [];

    const boxes = document.querySelectorAll('.district-row .contiguity-label input');
    if (!boxes.length) {
      return;
    }
    let noneChecked = !checkboxFlipped;
    boxes.forEach((box, d) => {
      if (box.checked) {
        islandAreas = islandAreas.concat(state.contiguity[d] || []);
        noneChecked = false;
      }
    });

    if (noneChecked) {
      return;
    }

    let demo = {
        ...unitBordersPaintProperty,
        "line-color": [
            "case",
            ["in", ["get", state.idColumn.key], ["literal", islandAreas]],
            "#f00000",
            unitBordersPaintProperty["line-color"]
        ],
        "line-opacity": 0.4,
        "line-width": ["case", ["in", ["get", state.idColumn.key], ["literal", islandAreas]], 4, 1],
    };
    state.unitsBorders.setPaintProperties(demo);
  }

  function setContiguityStatus(contiguity_breaks) {
    let cont_status = document.querySelector("#contiguity-status");
    if (cont_status) {
      cont_status.innerText =
        contiguity_breaks.length
            ? "Districts may have contiguity gaps"
            : "No contiguity gaps detected";

      let myDistricts = document.querySelectorAll('.district-row .contiguity-label');
      for (let d = 0; d < myDistricts.length; d++) {
        // show-hide label altogether
        myDistricts[d].style.display = contiguity_breaks.includes(d) ? "flex" : "none";

        // checkbox
        let box = myDistricts[d].querySelector('input');
        if (box) {
          myDistricts[d].querySelector('input').onchange = () => {
            document.querySelector('#unassigned-checker input').checked = false;
            updateIslandBorders(true);
          };
        }
      }
    }
    updateIslandBorders();
  }
  const updater = (state, colorsAffected) => {
    const units = state.unitsRecord.id;
    let stateName = state.place.id;
    if (state.place.id === "dc") {
      stateName = "district_of_columbia";
    } else if (stateNameToFips[state.place.id] || state.unitsRecord.id.includes("blockgroup") || state.unitsRecord.id.includes("vtds20")) {
      stateName = state.place.state;
    }

    let assign = Object.fromEntries(Object.entries(state.plan.assignment).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]));
    fetch("https://gvd4917837.execute-api.us-east-1.amazonaws.com/district_contiguity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        "state": stateName,
        "units": units,
        "assignment": assign})
    })
      .then((res) => res.json())
      .catch((e) => console.error(e))
      .then((data) => {
        state.contiguity = {};
        let issues = [];
        Object.keys(data).forEach((district) => {
          if (data[district].length > 1) {
            // basic contiguity
            issues.push(Number(district));

            // identify largest section and highlight others
            let islandareas = [];
            data[district].sort((a, b) => { return b.length - a.length }).slice(1).forEach(island => {
              islandareas = islandareas.concat(island);
            })
            state.contiguity[Number(district)] = islandareas;
          } else {
            state.contiguity[Number(district)] = null;
          }
        });
        setContiguityStatus(issues);
      });
  };

  let allDistricts = [],
    i = 0;
  while (i < state.problem.numberOfParts) {
    allDistricts.push(i);
    i++;
  }
  updater(state, allDistricts);

  return updater;
}
