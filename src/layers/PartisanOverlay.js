import Overlay from "./Overlay";
import { voteShareRule } from "./color-rules";

export default class PartisanOverlay {
    constructor(layers, election) {
        // Overlays are identified by party.key
        this._overlays = election.parties.reduce(
            (overlays, party) => ({
                ...overlays,
                [party.key]: new Overlay(layers, party, voteShareRule)
            }),
            {}
        );
        this._overlaysList = election.parties.map(
            party => this._overlays[party.key]
        );

        this.election = election;
        this.isVisible = false;

        this.setLayer = this.setLayer.bind(this);
        this.getOverlay = this.getOverlay.bind(this);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.allOverlays = this.allOverlays.bind(this);
        this.setColorRule = this.setColorRule.bind(this);
    }
    setLayer(i) {
        this.allOverlays().forEach(overlay => overlay.setLayer(i));
    }
    show() {
        this.allOverlays().forEach(overlay => overlay.show());
        this.isVisible = true;
    }
    hide() {
        this.allOverlays().forEach(overlay => overlay.hide());
        this.isVisible = false;
    }
    allOverlays() {
        return this._overlaysList;
    }
    getOverlay(party) {
        return this._overlays[party.key];
    }
    setColorRule(rule) {
        this.allOverlays().forEach(overlay => overlay.setColorRule(rule));
    }
}
