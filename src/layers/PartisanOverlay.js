import Overlay from "./Overlay";
import { voteShareRule } from "./color-rules";

export default class PartisanOverlay {
    constructor(layers, election, countyFilter) {
        // Overlays are identified by party.key
        // console.log(election.parties.length);
        this._overlays = election.parties.reduce(
            (overlays, party) => ({
                ...overlays,
                [party.key]: new Overlay(layers, party, voteShareRule(election.parties.length, countyFilter))
            }),
            {}
        );
        this._overlaysList = election.parties.map(
            party => this._overlays[party.key]
        );

        if (election.alternate) {
            this._altover = election.alternate.parties.reduce(
                (overlays, party) => ({
                    ...overlays,
                    [party.key]: new Overlay(layers, party, voteShareRule(election.parties.length, countyFilter))
                }),
                {}
            );
            this._alternateList = election.alternate.parties.map(
                party => this._altover[party.key]
            );
        } else {
            this._altover = [];
            this._alternateList = [];
        }

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
        this.oppOverlays().forEach(overlay => overlay.setLayer(i));
    }
    show(use_alternate) {
        if (use_alternate && use_alternate !== "all") {
            this.allOverlays().forEach(overlay => overlay.hide());
            this.oppOverlays().forEach(overlay => overlay.show());
        } else {
            this.oppOverlays().forEach(overlay => overlay.hide());
            this.allOverlays().forEach(overlay => overlay.show());
        }
        this.isVisible = true;
    }
    hide() {
        this.allOverlays().forEach(overlay => overlay.hide());
        this.oppOverlays().forEach(overlay => overlay.hide());
        this.isVisible = false;
    }
    allOverlays() {
        return this._overlaysList;
    }
    oppOverlays() {
        return this._alternateList || [];
    }
    getOverlay(party) {
        return this._overlays[party.key];
    }
    setColorRule(rule) {
        this.allOverlays().forEach(overlay => overlay.setColorRule(rule));
    }
}
