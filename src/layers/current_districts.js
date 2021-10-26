import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import Layer, { addBelowLabels } from "../map/Layer";

if (!window.blayers) {
  window.blayers = {};
}

export function addBoundaryLayer(config, map) {
  const prefix = config.path.includes("city_border") ? '/assets/' : '/assets/boundaries/';
  let shadeNames = ["case"];
  const alt_paint = {
    "fill-outline-color": "#000",
    "fill-color": shadeNames,
    "fill-opacity": 0
  };

  if (!window.blayers[config.id]) {
    window.blayers[config.id] = true;
    fetch(`${prefix}${config.path}.geojson?v=2`).then(res => res.json()).then(gj => {
        if (map.getSource(config.id)) {
          return;
        }
        if (config.fill_alt && gj.features.length) {
            let knownNames = new Set(), r = 50, g = 70, b = 150;
            if (config.fill_alt === "orange") {
              r = 230;
              g = 174;
              b = 105;
            }
            const namefield = config.namefield || "NAME";
            gj.features.forEach((f, idx) => {
                if (knownNames.has(name)) {
                    return;
                }
                knownNames.add(f.properties[namefield]);
                if (shadeNames.length % 40 === 0) {
                    r = 50,
                    g = 70,
                    b = 150
                }
                shadeNames.push(["==", ["get", namefield], f.properties[namefield]]);
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
            });
            shadeNames.push("#ddd");
        }

        map.addSource(config.id, {
          type: 'geojson',
          data: gj
        });
        window.blayers[config.id] = new Layer(
            map,
            {
                id: config.id,
                type: (config.fill ? 'fill' : 'line'),
                source: config.id,
                paint: config.fill ? (config.fill_alt ? alt_paint : ({
                    'fill-color': config.fill || '#444',
                    'fill-opacity': 0,
                    'fill-outline-color': '#444',
                })) : {
                    'line-color': config.lineColor || '#000',
                    'line-opacity': 0,
                    'line-width': config.lineWidth || 1.5,
                }
            },
            addBelowLabels
        );
    });
  }

  if (config.centroids && !blayers[`${config.path}_centroids`]) {
    window.blayers[`${config.path}_centroids`] = true;
    fetch(`${prefix}${config.path}_centroids.geojson?v=2`).then(res => res.json()).then(centroids => {
        if (map.getSource(`${config.id}_centroids`)) {
          return;
        }
        map.addSource(`${config.id}_centroids`, {
            type: 'geojson',
            data: centroids
        });
        const haloColor = config.fill
          ? 'rgba(255, 255, 250, 0.75)'
          : 'rgba(215, 215, 210, 0.6)';
        window.blayers[`${config.id}_centroids`] = new Layer(map, {
            id: `${config.id}_centroids`,
            source: `${config.id}_centroids`,
            type: 'symbol',
            layout: {
              'text-field': [
                  'format',
                  ['get', config.namefield || 'NAME'],
                  {'font-scale': 0.75},
              ],
              'text-anchor': 'center',
              'text-radial-offset': 0,
              'text-justify': 'center',
              // 'text-allow-overlap': true,
              // 'text-ignore-placement': true,
            },
            paint: {
              'text-opacity': 0,
              'text-halo-blur': 3,
              'text-halo-width': 2,
              'text-halo-color': haloColor,
            }
        });
    });
  }

  return html`
    ${toggle(config.label, false, checked => {
        let opacity = checked ? (config.fill ? (config.fill_alt ? 0.2 : 0.55) : 1) : 0;
        window.blayers[config.id] && window.blayers[config.id].setOpacity(opacity)
        window.blayers[`${config.id}_centroids`] && window.blayers[`${config.id}_centroids`].setPaintProperty('text-opacity', checked ? 1 : 0);
    })}`
}
