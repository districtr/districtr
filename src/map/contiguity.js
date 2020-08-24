/* eslint-disable linebreak-style */

function setContiguityStatus(contiguity_object) {
  let contiguous = contiguity_object.contiguity;
  document.querySelector("#contiguity-status").innerText = !contiguous
    ? "Districts may have contiguity gaps"
    : "Any districts are contiguous";
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
        setContiguityStatus(data);
        // TODO think about how to separate these two things
        // saveplan['placeId'] is the name of the state
        setNumCutEdges(data, saveplan['placeId']);
        return data;
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


// TODO think about how to separate this function away
function setNumCutEdges(json_response, state_name) {
  let str = json_response.cut_edges; // this is a string
  // "{(12, 17), (2, 42).... (19, 56)}"
  // Convert from Python format to Javascript
  str = str.replace("{", "[");
  str = str.replace("}", "]");
  str = str.replaceAll("(", "[");
  str = str.replaceAll(")", "]");
  let cut_edges = JSON.parse(str);

  document.querySelector("#num-cut-edges").innerText = cut_edges.length;

  // how do we get the json_response
  const state_info = {
    'connecticut': {
      state_png: 'url("../assets/cut_edges_histograms/ct.png")',
      state_csv: "../assets/cut_edges_histograms/CT_chain_10000.csv",
      lr_bounds: [110, 270],
    },
    'iowa': {
      state_png: 'url("../assets/cut_edges_histograms/ia.png")',
      state_csv: "../assets/cut_edges_histograms/IA_chain_10000.csv",
      // lr_bounds: [20, 80],
      lr_bounds: [150, 470],
    },
    'texas': {
      state_png: 'url("../assets/cut_edges_histograms/ct.png")',
      state_csv: "../assets/cut_edges_histograms/TX_chain_10000.csv",
      //lr_bounds: [1900, 3000],
      lr_bounds: [2720, 3440],
    }
  }

  console.log(state_name)

  var view;
  const vega_json = form_vega_json(state_name)

  function form_vega_json(state_name) {
    const vega_json = {
      "$schema": "https://vega.github.io/schema/vega-lite/v4.json",
      "data": { "url": state_info[state_name]['state_csv'] },
      "layer": [
        {
          "mark": "bar",
          "width": 400,
          "encoding": {
            "x": {
              "bin": { "maxbins": 40 },
              "field": "cut_edges",
              //"type": "ordinal"
            },
            "y": { "aggregate": "count" }
          }
        }
      ],
      "config": {
        "axisY": {
          "labels": false,
          "title": null
        }
      }
    }

    return vega_json;
  }

  const cs = document.querySelector("#cut_edges_distrib_canvas");
  vegaEmbed('.cut_edges_distribution_vega', vega_json).then((res) => {
    const url = res['view'].toImageURL('png').then((url) => {
      const url_string = `url(${url})`;

      // const hist_img = document.querySelector("#cut_edges_distrib_img");
      // hist_img.src = url_string;

      const cs = document.querySelector("#cut_edges_distrib_canvas");
      // cs.style.setProperty("background-image", state_info[state_name]["state_png"]);
      cs.style.setProperty("background-image", url_string);
      cs.style.setProperty("background-size", "contain");
      cs.style.setProperty("background-repeat", "no-repeat");

      // Get the lower and upper bounds on the number of cut edges
      const left_bound = state_info[state_name]["lr_bounds"][0];
      const right_bound = state_info[state_name]["lr_bounds"][1];
      const num_cut_edges = cut_edges.length;

      draw_line_on_canvas(cs, num_cut_edges, left_bound, right_bound)
      //draw_line_on_canvas(cs, num_cut_edges, left_bound, right_bound)
    })
  });


  /*
  // Get the canvas, and set its background image to the saved histogram
  // (thanks Gabe)
  const cs = document.querySelector("#cut_edges_distrib_canvas");
  cs.style.setProperty("background-image", state_info[state_name]["state_png"]);
  cs.style.setProperty("background-size", "contain");
  cs.style.setProperty("background-repeat", "no-repeat");
  console.log(cs.style);

  // Get the <img> element, and set its background image to the saved histogram
  const hist_img = document.querySelector("#cut_edges_distrib_img");
  hist_img.src = state_info[state_name]["state_png"];

  // naturalHeight is the intrinsic height of the image in CSS pixels
  const nh = document.querySelector("#cut_edges_distrib_img").naturalHeight;
  const nw = document.querySelector("#cut_edges_distrib_img").naturalWidth;
  // height/width is the rendered height/width of the image in CSS pixels

  // Get the lower and upper bounds on the number of cut edges
  const left_bound = state_info[state_name]["lr_bounds"][0];
  const right_bound = state_info[state_name]["lr_bounds"][1];
  const num_cut_edges = cut_edges.length;

  draw_line_on_canvas(cs, num_cut_edges, left_bound, right_bound)
  */
}

function draw_line_on_canvas(canvas, num_cut_edges, left_bound, right_bound) {
  let line_position = 0; // this is going to be a value between 0 and w

  if (num_cut_edges <= left_bound) {
    line_position = 0;
  } else if (num_cut_edges >= right_bound) {
    line_position = canvas.width;
  } else {
    line_position = ((num_cut_edges - left_bound) /
      (right_bound - left_bound)) * canvas.width;
  }

  const w = canvas.width;
  const h = canvas.height;
  console.log("Line position:", line_position);
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, w, h);
  ctx.lineWidth = 2;
  ctx.strokeStyle = "red";
  ctx.beginPath();
  ctx.moveTo(line_position, 0);
  ctx.lineTo(line_position, h);
  ctx.closePath();
  ctx.stroke();
}