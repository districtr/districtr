/* eslint-disable linebreak-style */

//  This is state information gotten from running 10,000 Recom steps
// I'll refactor this
const state_info = {
  'connecticut': {
    state_csv: "../assets/cut_edges_histograms/CT_chain_10000.csv",
    lr_bounds: [110, 270],
  },
  'iowa': {
    state_csv: "../assets/cut_edges_histograms/IA_chain_10000.csv",
    lr_bounds: [32, 60],
  },
  'texas': {
    state_csv: "../assets/cut_edges_histograms/TX_chain_10000.csv",
    lr_bounds: [2720, 3440],
  }
}

// This makes a POST request to a PythonAnywhere server
// with the assignment in the request body.
// The server will return a response with the
// 1. contiguity status and
// 2. number of cut edges
// and this function then calls two other functions (defined above)
// that modify the innerHTML of the file
export default function ContiguityChecker(state) {
  if (!state.contiguity) {
    state.contiguity = {};
  }

  const updater = (state, colorsAffected) => {
    let saveplan = state.serialize();
    console.log(saveplan)
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
        console.log(data);

        // Set contiguity status
        setContiguityStatus(data);

        // Set number of cut edges
        let num_cut_edges = setNumCutEdges(data, state_name);

        // Embed the canvas 
        const state_name = saveplan['placeId'];
        const container = document.querySelector(".cut_edges_distribution_vega");
        const vega_json = __form_vega_json__(state_name)
        vegaEmbed(container, vega_json).then((v) => {

          // Wait for vegaEmbed to generate the canvas, then draw a line on it
          const canvas = document.querySelector(".marks");
          const left_bound = state_info[state_name]["lr_bounds"][0];
          const right_bound = state_info[state_name]["lr_bounds"][1];

          __draw_line_on_canvas__(canvas, num_cut_edges, left_bound, right_bound)
        })

        return data;
      });
  };

  // Not sure what this does --- might want to remove it
  let allDistricts = [],
    i = 0;
  while (i < state.problem.numberOfParts) {
    allDistricts.push(i);
    i++;
  }
  updater(state, allDistricts);
  return updater;
}


function setContiguityStatus(contiguity_object) {
  let contiguous = contiguity_object.contiguity;
  document.querySelector("#contiguity-status").innerText = !contiguous
    ? "Districts may have contiguity gaps"
    : "Any districts are contiguous";
}

function setNumCutEdges(json_response, state_name) {
  let num_cut_edges = json_response.cut_edges;

  document.querySelector("#num-cut-edges").innerText = num_cut_edges;
  return num_cut_edges
}


function __draw_line_on_canvas__(canvas, num_cut_edges, left_bound, right_bound) {
  let line_position = 0; // this is going to be a value between 0 and w

  if (num_cut_edges <= left_bound) {
    line_position = 0;
  } else if (num_cut_edges >= right_bound) {
    line_position = canvas.width;
  } else {
    line_position = ((num_cut_edges - left_bound) /
      (right_bound - left_bound)) * canvas.width;
  }

  console.log("Line position: ", line_position)

  const w = canvas.width;
  const h = canvas.height;
  console.log("Line position:", line_position);
  const ctx = canvas.getContext("2d");
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(line_position, 0);
  ctx.lineTo(line_position, h);
  ctx.closePath();
  ctx.stroke();
}


// Returns the Vega Lite schema needed for rendering the state cut edge histogram dynamically
function __form_vega_json__(state_name) {
  const vega_json = {
    "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
    "data": { "url": state_info[state_name]['state_csv'] },
    "mark": "bar",
    "width": "container",
    "autosize": {
      "type": "fit",
      "contains": "padding",
    },
    "encoding": {
      "x": {
        "bin": { "maxbins": 40 },
        "field": "cut_edges",
      },
      "y": { "aggregate": "count" }
    },
    "config": {
      "axisY": {
        "labels": false,
        "title": null
      },
      "axisX": {
        "title": null
      }
    }
  }

  return vega_json;
}