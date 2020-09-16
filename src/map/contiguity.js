/* eslint-disable linebreak-style */

function setContiguityStatus(contiguity_breaks) {
  document.querySelector("#contiguity-status").innerText =
      contiguity_breaks.length
          ? "Districts may have contiguity gaps"
          : "No contiguity gaps detected";
  let myDistricts = document.querySelectorAll('.district-row .part-number');
  for (let d = 0; d < myDistricts.length; d++) {
     myDistricts[d].style.display = contiguity_breaks.includes(d) ? "flex" : "none";
  }
}

// This makes a POST request to a PythonAnywhere server
// with the assignment in the request body.
// The server will return a response with the
// 1. contiguity status and
// 2. number of cut edges
// and this function then calls two other functions (defined above)
// that modify the innerHTML of the file
export default function ContiguityChecker(state, brush) {
  if (!state.contiguity) {
    state.contiguity = {};
  }

  const updater = (state, colorsAffected) => {
    let saveplan = state.serialize();
    const GERRYCHAIN_URL = "//mggg.pythonanywhere.com";
    fetch(GERRYCHAIN_URL, {
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
        data.split.forEach((district) => {
          state.contiguity[district] = true;
        });
        setContiguityStatus(data.split);
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
