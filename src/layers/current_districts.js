import { html } from "lit-html";
import { toggle } from "../components/Toggle";

import Layer, { addBelowLabels } from "../map/Layer";

export function addCurrentDistricts(tab, state) {
    let borders = {},
        placeID = state.place.state.toLowerCase().replace(" ","");
    
    // current districts should be stored in assets/current_districts/[state]/
    // if the state name is two words, it should be just have the space removed
    console.log(placeID);
    fetch(`/assets/current_districts/${placeID}/us_house.geojson`).then(res => res.json()).then((fed) => {
    fetch(`/assets/current_districts/${placeID}/state_house.geojson`).then(res => res.json()).then((state_house) => {
    fetch(`/assets/current_districts/${placeID}/state_senate.geojson`).then(res => res.json()).then((state_senate) => {

        state.map.addSource('fed_districts', {
            type: 'geojson',
            data: fed
        });
        state.map.addSource('state_house', {
            type: 'geojson',
            data: state_house
        });
        state.map.addSource('state_senate', {
            type: 'geojson',
            data: state_senate
        });

        borders.house = new Layer(
            state.map,
            {
                id: 'state_house',
                type: 'line',
                source: 'state_house',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1.5
                }
            },
            addBelowLabels
        );
        borders.federal = new Layer(
            state.map,
            {
                id: 'fed_districts',
                type: 'line',
                source: 'fed_districts',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 2
                }
            },
            addBelowLabels
        );
        borders.senate = new Layer(
            state.map,
            {
                id: 'state_senate',
                type: 'line',
                source: 'state_senate',
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1.5
                }
            },
            addBelowLabels
        );
    })})});

    let currentBorder = null;
    let showBorder = (e, lyr) => {
        Object.keys(borders).forEach(lvl => {
            borders[lvl].setOpacity(lyr === lvl ? 1 : 0);
        });
    };

    tab.addSection(() => html`
        <h4>Current Districts</h4>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="hidden" @change="${e => showBorder(null)}" checked/>
            Hidden
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="fed" @change="${e => showBorder(e, 'federal')}"/>
            US Congress
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="senate" @change="${e => showBorder(e, 'senate')}"/>
            State Senate
          </label>
        </li>
        <li>
          <label style="cursor: pointer;">
            <input type="radio" name="districts" value="house" @change="${e => showBorder(e, 'house')}"/>
            State House
          </label>
        </li>
    `);
}
