import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import Layer, { addBelowLabels } from "../map/Layer";

if (!window.blayers) {
  window.blayers = {};
}

export function addBoundaryLayer(config, map) {
  const prefix = config.path.includes("city_border") ? '/assets/' : '/assets/boundaries/';
  if (!window.blayers[config.id]) {
    window.blayers[config.id] = true;
    fetch(`${prefix}${config.path}.geojson?v=2`).then(res => res.json()).then(gj => {
        if (map.getSource(config.id)) {
          return;
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
                paint: config.fill ? {
                    'fill-color': config.fill || '#444',
                    'fill-opacity': 0,
                    'fill-outline-color': '#070',
                } : {
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
              'text-halo-color': 'rgba(215, 215, 210, 0.6)',
            }
        });
    });
  }

  return html`
    ${toggle(config.label, false, checked => {
        let opacity = checked ? (config.fill ? 0.55 : 1) : 0;
        window.blayers[config.id] && window.blayers[config.id].setOpacity(opacity)
        window.blayers[`${config.id}_centroids`] && window.blayers[`${config.id}_centroids`].setPaintProperty('text-opacity', opacity);
    })}`
}
