import { html } from "lit-html";
import { toggle } from "../components/Toggle";

import Layer, { addBelowLabels } from "../map/Layer";

// NC Native Am: https://ncadmin.nc.gov/public/american-indians/map-nc-tribal-communities

const amin_type = "shades";
let shadeNames = ["case"];
const amin_paint = {
  "fill-outline-color": "#000",
  "fill-color": shadeNames,
  "fill-opacity": 0.15
};

const AMERINDIAN_LAYER = {
    id: "nativeamerican",
    source: "nativeamerican",
    type: "fill",
    paint: amin_paint
};

export function addAmerIndianLayer(tab, state) {
    let nativeamerican = null,
        nativeamerican_labels = null,
        startFill = (window.location.search.includes("native=true") || window.location.search.includes("amin=")) ? 0.15 : 0;

        let native_am_type = "Pueblos, Tribes, and Nations"; // NM
    if (state.place.state === "Alaska") {
        native_am_type = "Alaska Native Communities";
    } else if (["Alabama", "Colorado", "Florida", "Georgia", "Idaho", "Iowa", "Kansas", "Louisiana", "Nebraska", "South Carolina", "South Dakota", "Wyoming"].includes(state.place.state)) {
        native_am_type = "Native American Areas (Census)";
    } else if (["California", "Connecticut", "Delaware", "Montana", "Oregon", "Virginia", "Wisconsin"].includes(state.place.state)) {
        native_am_type = "Tribal Nations";
    } else if (state.place.state === "Hawaii") {
        native_am_type = "Hawaiian Home Lands";
    } else if (state.place.state === "Oklahoma") {
        native_am_type = "Indian Country";
    } else if (state.place.state === "Maine") {
        native_am_type = "Tribes in Maine";
    } else if (["New York", "Utah"].includes(state.place.state)) {
        native_am_type = "Native American Areas (Census)";
    } else if (state.place.state === "Texas") {
        native_am_type = "Indian Nations";
    } else if (state.place.state === "Nevada") {
        native_am_type = "Indian Territory";
    } else if (["Michigan", "Minnesota"].includes(state.place.state)) {
        native_am_type = "Tribal Governments";
    } else if (["Massachusetts", "Rhode Island", "Washington", "Arizona"].includes(state.place.state)) {
        native_am_type = "Nations and Tribes";
    } else if (["North Carolina", "New Jersey"].includes(state.place.state)) {
        native_am_type = "Tribal Communities";
    } else if (state.place.state === "North Dakota") {
        native_am_type = "Tribes and Communities";
    } else if (state.place.state === "Mississippi") {
        native_am_type = "Mississippi Band of Choctaw Indians";
    }

    let stateSource = state.place.state.toLowerCase().replace(" ", "");

    fetch(`/assets/native_official/${stateSource}.geojson?v=2`)
        .then(res => res.json())
        .then((geojson) => {

        let knownNames = new Set(), r, g, b;
        shadeNames.splice(1);
        geojson.features.forEach((space, index) => {
            if (index % 20 === 0) {
                r = 50,
                g = 70,
                b = 150
            }
            let name = space.properties.NAME;
            if (!knownNames.has(name)) {
                shadeNames.push(["==", ["get", "NAME"], name || ""]);
                knownNames.add(name);
                knownNames.add(`rgb(${r},${g},${b})`);
                r += 6;
                g += 22;
                b -= 26;
                if (g > 170) {
                    g = 70;
                }
                if (b < 80) {
                    b = 150;
                }
                shadeNames.push(`rgb(${r},${g},${b})`);
            }
        });
        shadeNames.push("#ddd");

        state.map.addSource('nativeamerican', {
            type: 'geojson',
            data: geojson
        });

        fetch(`/assets/native_official/${stateSource}_centroids.geojson?v=2`)
            .then(res => res.json())
            .then((centroids) => {

            state.map.addSource('nat_centers', {
                type: 'geojson',
                data: centroids
            });

            nativeamerican_labels = new Layer(
                state.map,
                {
                  id: 'nat-labels',
                  type: 'symbol',
                  source: 'nat_centers',
                  layout: {
                    'text-field': [
                        'format',
                        '\n',
                        {},
                        ['get', 'NAME'],
                        {'font-scale': 0.75},
                        '\n\n',
                        {}
                    ],
                    'text-anchor': 'center',
                    // 'text-ignore-placement': true,
                    'text-radial-offset': 0,
                    'text-justify': 'center'
                  },
                  paint: {
                    'text-opacity': (startFill ? 1 : 0)
                  }
                },
                addBelowLabels
            );

            nativeamerican = new Layer(
                state.map,
                {
                    ...AMERINDIAN_LAYER,
                    paint: { ...AMERINDIAN_LAYER.paint, "fill-opacity": startFill }
                },
                addBelowLabels
            );
        });
    });

    tab.addSection(
        () => html`
            ${toggle("Show " + native_am_type, false, (checked) => {
                nativeamerican.setOpacity(
                    checked ? AMERINDIAN_LAYER.paint["fill-opacity"] : 0
                );
                if (nativeamerican_labels) {
                    nativeamerican_labels.setOpacity(checked ? 1 : 0, true);
                }
            })}
        `
    );
}
