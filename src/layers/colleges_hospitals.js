import { html } from "lit-html";
import { toggle } from "../components/Toggle";

import Layer, { addBelowLabels } from "../map/Layer";

export function addPOILayers(tab, state) {
  let colleges = null, hospitals = null;

  fetch(`/assets/colleges/${state.place.id}.geojson`).then(res => res.json()).then(gj => {
    state.map.addSource('colleges', {
      type: "geojson",
      data: gj
    });
    colleges = new Layer(
      state.map,
      {
         id: "colleges",
         source: "colleges",
         type: "circle",
         paint: {
           'circle-radius': 4,
           'circle-opacity': 0,
           'circle-color': 'blue'
         }
      }
    );
  });
  fetch(`/assets/hospitals/${state.place.id}.geojson`).then(res => res.json()).then(gj => {
    state.map.addSource('hospitals', {
      type: "geojson",
      data: gj
    });
    hospitals = new Layer(
      state.map,
      {
         id: "hospitals",
         source: "hospitals",
         type: "circle",
         paint: {
           'circle-radius': 4,
           'circle-opacity': 0,
           'circle-color': 'red'
         }
      }
    );
  });

  tab.addSection(
      () => html`<h3 style="margin-bottom:0">
        Infrastructure
      </h3>
      <div class="section_coi2">
          ${toggle(`Show colleges`, false, checked =>
              colleges.setOpacity(checked ? 1 : 0),
              "collegesVisible"
          )}
          ${toggle(`Show hospitals`, false, checked =>
              hospitals.setOpacity(checked ? 1 : 0),
              "hospitalsVisible"
          )}
      </div>`
  );
}
