import Layer from "./Layer";

export default class PartisanOverlay extends Layer {
    constructor(unitsLayer, election, party, getFillColorRule) {
        super(
            unitsLayer.map,
            {
                id: `${party}-overlay`,
                source: unitsLayer.sourceId,
                "source-layer": unitsLayer.sourceLayer,
                type: "fill",
                paint: {
                    "fill-color": getFillColorRule(unitsLayer, election, party),
                    "fill-opacity": 0
                }
            },
            (map, layer) => map.addLayer(layer, unitsLayer.id)
        );
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
        this.setPaintProperty(
            "fill-color",
            this.getFillColorRule(this, this.election, this.party)
        );
    }
}
