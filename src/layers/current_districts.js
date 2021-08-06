import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import { spatial_abilities, nested, one_cd} from "../utils";
import Layer, { addBelowLabels } from "../map/Layer";

export function addBoundaryLayers(tab, state, current_districts, school_districts, municipalities) {
    // check if we have to draw anything, if not, just leave
    if (!current_districts && !school_districts && !municipalities)
        return;
    let borders = {},
        stateID = state.place.state.toLowerCase().replace(" ",""),
        placeID = stateID;
    if (stateID === "california") {
        placeID = state.place.id;
    }
    // current districts should be stored in assets/boundaries/current_districts/[state]/
    // if the state name is two words, it should be just have the space removed
    if (current_districts) {
        fetch(`/assets/boundaries/current_districts/${placeID}/state_house.geojson`).then(res => res.json()).then((state_house) => {
        fetch(`/assets/boundaries/current_districts/${placeID}/state_senate.geojson`).then(res => res.json()).then((state_senate) => {

            state.map.addSource('state_house', {
                type: 'geojson',
                data: state_house
            });
            state.map.addSource('state_senate', {
                type: 'geojson',
                data: state_senate
            });

            borders.senate = new Layer(
                state.map,
                {
                    id: 'state_senate',
                    type: 'line',
                    source: 'state_senate',
                    paint: {
                        'line-color': '#000',
                        'line-opacity': 0,
                        'line-width': nested(placeID) ? 2 : 1.5
                    }
                },
                addBelowLabels
            );
            borders.house = new Layer(
                state.map,
                {
                    id: 'state_house',
                    type: 'line',
                    source: 'state_house',
                    paint: nested(placeID) ?
                    {
                        'line-color': '#ff0000',
                        'line-opacity': 0,
                        'line-width': .75
                    } :
                    {
                        'line-color': '#000',
                        'line-opacity': 0,
                        'line-width': 1.5
                    }
                },
                addBelowLabels
            );
            if (!one_cd(placeID)) {
                fetch(`/assets/boundaries/current_districts/${placeID}/us_house.geojson`).then(res => res.json()).then((fed) => {

                    state.map.addSource('fed_districts', {
                        type: 'geojson',
                        data: fed
                    });

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

                })
            }
        })});
    }

    // school districts should be stored in /assets/boundaries/school_districts/[state]/
    if (school_districts) {
        fetch(`/assets/boundaries/school_districts/${placeID}/${placeID}_schools.geojson`).then(res => res.json()).then((schools) => {
        fetch(`/assets/boundaries/school_districts/${placeID}/${placeID}_schools_centroids.geojson`).then(res => res.json()).then((centroids) => {

            state.map.addSource('schools', {
                type: 'geojson',
                data: schools
            });
            borders.schools = new Layer(state.map,
                {
                    id: 'schools',
                    source: 'schools',
                    type: 'line',
                    paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                },
                addBelowLabels
            );

            state.map.addSource('centroids', {
                type: 'geojson',
                data: centroids
            });
            borders.school_labels = new Layer(state.map,
                {
                    id: 'centroids',
                    source: 'centroids',
                    type: 'symbol',
                    layout: {
                    'text-field': [
                        'format',
                        ['get', 'NAME'],
                        {'font-scale': 0.75},
                    ],
                    'text-anchor': 'center',
                    'text-radial-offset': 0,
                    'text-justify': 'center'
                    },
                    paint: {
                    'text-opacity': 0
                    }
                },
                addBelowLabels
            );
        })});
    }
    // municipal boundaries should be stored in /assets/boundaries/municipalities/[state]/
    if (municipalities) {
        fetch(`/assets/boundaries/municipalities/${stateID}/${placeID}_municipalities.geojson`).then(res => res.json()).then((muni) => {
        fetch(`/assets/boundaries/municipalities/${stateID}/${placeID}_municipalities_centroids.geojson`).then(res => res.json()).then((centroids) => {

            state.map.addSource('muni', {
                type: 'geojson',
                data: muni
            });
            borders.municipalities = new Layer(state.map,
                {
                    id: 'muni',
                    source: 'muni',
                    type: 'line',
                    paint: { "line-color": "#000", "line-width": 2, "line-opacity": 0 }
                },
                addBelowLabels
            );

            state.map.addSource('muni_centroids', {
                type: 'geojson',
                data: centroids
            });
            borders.muni_labels = new Layer(state.map,
                {
                    id: 'muni_centroids',
                    source: 'muni_centroids',
                    type: 'symbol',
                    layout: {
                    'text-field': [
                        'format',
                        ['get', 'NAME'],
                        {'font-scale': 0.75},
                    ],
                    'text-anchor': 'center',
                    'text-radial-offset': 0,
                    'text-justify': 'center'
                    },
                    paint: {
                    'text-opacity': 0
                    }
                },
                addBelowLabels
            );
        })});
    }

    let currentBorder = null;
    let showBorder = (e, lyr) => {
        Object.keys(borders).forEach(lvl => {
            // have to link the labels to the schools
            if (lvl === 'school_labels')
                borders[lvl].setPaintProperty('text-opacity', (lyr === 'schools') ? 1 : 0);
            else if (lvl === 'muni_labels')
                borders[lvl].setPaintProperty('text-opacity', (lyr === 'municipalities') ? 1 : 0);
            else if (nested(placeID) && lvl == 'house')
                borders[lvl].setOpacity((lyr === 'senate') ? 1 : 0);
            else
                borders[lvl].setOpacity(lyr === lvl ? 1 : 0);
        });
    };

    // create radio buttons depending on what exists
    tab.addSection(() =>
        html`
        <div id='district-overlay'>
            <h5>Additional Boundaries</h5>
            <li>
                <label style="cursor: pointer;">
                    <input type="radio" name="districts" value="hidden" @change="${e => showBorder(null)}" checked/>
                    Hidden
                </label>
            </li>

            ${current_districts ? ((nested(placeID) && (state.place.id === "chicago" || one_cd(placeID))) ? 
                html`<li>
                    <label style="cursor: pointer;">
                        <input type="radio" name="districts" value="senate" @change="${e => showBorder(e, 'senate')}"/>
                        ${ state.place.id === "chicago" ? "Police Districts" : "State Legislature (Nested)"}
                    </label>
                </li>` : (!nested(placeID) && one_cd(placeID)) ?
                    html`<li>
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
                    </li>` : nested(placeID) ?
                        html`<li>
                            <label style="cursor: pointer;">
                                <input type="radio" name="districts" value="fed" @change="${e => showBorder(e, 'federal')}"/>
                                US Congress
                            </label>
                        </li>
                        <li>
                            <label style="cursor: pointer;">
                                <input type="radio" name="districts" value="senate" @change="${e => showBorder(e, 'senate')}"/>
                                State Legislature (Nested)
                            </label>
                        </li>` :
                        html`<li>
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
                        </li>`) : ""}
                ${school_districts ?
                    html`<li>
                        <label style="cursor: pointer;">
                            <input type="radio" name="districts" value="schools" @change="${e => showBorder(e, 'schools')}"/>
                            School Districts
                        </label>
                    </li>` : ""}
                ${municipalities ? 
                    html`<li>
                        <label style="cursor: pointer;">
                            <input type="radio" name="districts" value="municipalities" @change="${e => showBorder(e, 'municipalities')}"/>
                            ${ state.place.id === "chicago" ? "Community Areas" : "Municipalities"}
                        </label>
                    </li>`: ""}
                </div>
                `
    )
}
