/* eslint-disable linebreak-style */

// This makes a POST request to a PythonAnywhere server
// with the assignment in the request body.
// The server will return a response with the
// 1. contiguity status and
// 2. number of cut edges
// and this function then calls two other functions (defined above)
// that modify the innerHTML of the file

import { unitBordersPaintProperty } from "../colors";

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

  function setContiguityStatus(contiguity_breaks) {
    document.querySelector("#contiguity-status").innerText =
        contiguity_breaks.length
            ? "Districts may have contiguity gaps"
            : "No contiguity gaps detected";
    let myDistricts = document.querySelectorAll('.district-row .part-number');
    for (let d = 0; d < myDistricts.length; d++) {
      myDistricts[d].style.display = contiguity_breaks.includes(d) ? "flex" : "none";
      myDistricts[d].onclick = (e) => {
        if (contiguity_breaks.includes(d)) {
          fetch(`https://mggg-states.subzero.cloud/rest/rpc/merged_${placeID}?ids=${state.contiguity[d].join(sep)}`).then(res => res.json()).then((centroid) => {
            if (typeof centroid === "object") {
                centroid = centroid[0][`merged_${placeID}`];
            }
            let latlng = centroid.split(" "),
                lat = latlng[1].split(")")[0] * 1,
                lng = latlng[0].split("(")[1] * 1,
                zoom = state.map.getZoom();
            let demo = {
                ...unitBordersPaintProperty,
                "line-color": [
                    "case",
                    ["in", ["get", state.idColumn.key], ["literal", state.contiguity[d]]],
                    "#ff00ff",
                    unitBordersPaintProperty["line-color"]
                ],
                "line-opacity": 0.4,
                "line-width": ["case", ["in", ["get", state.idColumn.key], ["literal", state.contiguity[d]]], 4, 1],
            };
            state.unitsBorders.setPaintProperties(demo);
            state.map.flyTo({
                center: [lng, lat],
                zoom: zoom > 13
                    ? zoom
                    : zoom + 2
            });
            setTimeout(() => {
                state.unitsBorders.setPaintProperties(unitBordersPaintProperty);
            }, 1000);
          });
        }
     };
    }
  }

  const updater = (state, colorsAffected) => {
    let saveplan = state.serialize();
    const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
    fetch(GERRYCHAIN_URL + "/contigv2", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(saveplan),
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

            // identify smallest section and make event-able
            state.contiguity[Number(district)] = data[district].sort((a, b) => { return a.length - b.length })[0]
                .slice(0, 100);
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
