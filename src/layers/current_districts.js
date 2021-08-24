import { html } from "lit-html";
import { toggle } from "../components/Toggle";
import Layer, { addBelowLabels } from "../map/Layer";

let layers = {};

export function addBoundaryLayer(config, map) {
  if (!map.getSource(config.id)) {
    fetch(`/assets/boundaries/${config.path}.geojson?v=2`).then(res => res.json()).then(gj => {
        if (map.getSource(config.id)) {
          return;
        }
        map.addSource(config.id, {
          type: 'geojson',
          data: gj
        });
        layers[config.id] = new Layer(
            map,
            {
                id: config.id,
                type: 'line',
                source: config.id,
                paint: {
                    'line-color': '#000',
                    'line-opacity': 0,
                    'line-width': 1.5
                }
            },
            addBelowLabels
        );
    });
  }

  if (config.centroids && !map.getSource(`${config.id}_centroids`)) {
    fetch(`/assets/boundaries/${config.path}_centroids.geojson?v=2`).then(res => res.json()).then(centroids => {
        if (map.getSource(`${config.id}_centroids`)) {
          return;
        }
        map.addSource(`${config.id}_centroids`, {
            type: 'geojson',
            data: centroids
        });
        layers[`${config.id}_centroids`] = new Layer(map, {
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
            'text-justify': 'center'
            },
            paint: {
              'text-opacity': 0
            }
        });
    });
  }

  return html`
    ${toggle(config.label, false, checked => {
        let opacity = checked ? 1 : 0;
        layers[config.id] && layers[config.id].setOpacity(opacity)
        layers[`${config.id}_centroids`] && layers[`${config.id}_centroids`].setPaintProperty('text-opacity', opacity);
    })}`
}
