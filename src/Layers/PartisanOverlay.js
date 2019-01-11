import Layer, { addBelowLabels } from "./Layer";

export default class PartisanOverlay extends Layer {
    constructor(unitsLayer, election, party, getFillColorRule) {
        let layerSpec = {
            id: `${unitsLayer.id}-${party}-overlay`,
            source: unitsLayer.sourceId,
            type: unitsLayer.type,
            paint: {
                [`${unitsLayer.type}-color`]: getFillColorRule(election, party),
                [`${unitsLayer.type}-opacity`]: 0
            }
        };
        if (unitsLayer.sourceLayer !== undefined) {
            layerSpec["source-layer"] = unitsLayer.sourceLayer;
        }

        super(unitsLayer.map, layerSpec, addBelowLabels);
        this.party = party;
        this.getFillColorRule = getFillColorRule;
        this.election = election;

        this.changeElection = this.changeElection.bind(this);
        this.setFillColorRule = this.setFillColorRule.bind(this);
        this.paint = this.paint.bind(this);

        // Awful hack to wait a few seconds and refresh the fill color rule:
        // The real problem is that we can't rely on querying the mapbox
        // vector tile source to get aggregate feature data, because there
        // is no guarantee that they'll load every feature. We'll need to
        // draw from CSV or json sent by the backend.
        window.setTimeout(() => this.changeElection(election), 5000);
    }
    changeElection(election) {
        this.election = election;
        this.paint();
    }
    setFillColorRule(rule) {
        this.getFillColorRule = rule;
        this.paint();
    }
    paint() {
        this.setColor(this.getFillColorRule(this.election, this.party));
    }
}
