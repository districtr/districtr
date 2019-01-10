import Layer from "./Layer";

export default class DemographicOverlay extends Layer {
    constructor(unitsLayer, population) {
        let layerSpec = {
            id: `${unitsLayer.id}-population-overlay`,
            source: unitsLayer.sourceId,
            type: unitsLayer.type,
            paint: {
                [`${unitsLayer.type}-color`]: [
                    "rgba",
                    0,
                    0,
                    0,
                    population.asMapboxExpression()
                ],
                [`${unitsLayer.type}-opacity`]: 0
            }
        };
        if (unitsLayer.sourceLayer !== undefined) {
            layerSpec["source-layer"] = unitsLayer.sourceLayer;
        }

        super(unitsLayer.map, layerSpec, (map, layer) =>
            map.addLayer(layer, unitsLayer.id)
        );
    }
}
