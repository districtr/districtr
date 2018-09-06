function addIdsToFeatures(data) {
  for (let index = 0; index < data.features.length; index++) {
    data.features[index].id = index;
  }
}

mapboxgl.accessToken =
  "pk.eyJ1IjoibWF4aHVsbHkiLCJhIjoiY2o1YTgxam5pMDU3YjMzbW0yZzd3amw5aCJ9.VNO4uwhbH_Ip4BBW-sN32g";

addIdsToFeatures(data);

let map = new mapboxgl.Map({
  container: "map", // container id
  style: "mapbox://styles/mapbox/streets-v9", // stylesheet location
  center: [-71.31, 42.63], // starting position [lng, lat]
  zoom: 12 // starting zoom
});

map.on("load", function() {
  addLowell(map);
});

function addLowell(map) {
  map.addSource("lowell", {
    type: "geojson",
    data: data
  });

  map.addLayer({
    id: "lowell",
    type: "fill",
    source: "lowell",
    layout: {},
    paint: { "fill-color": "hsla(100, 50%, 50%, 0.5)" }
  });
}
